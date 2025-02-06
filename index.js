#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync, exec } = require('child_process');
const readline = require('readline');

// Función para solicitar input del usuario
function preguntar(mensaje) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(mensaje, (respuesta) => {
      rl.close();
      resolve(respuesta.trim());
    });
  });
}

(async () => {
  let nombreProyecto = process.argv[2];

  // Si no se proporciona el nombre del proyecto, lo solicitamos
  if (!nombreProyecto) {
    nombreProyecto = await preguntar('\n\nNombre del proyecto: ');
  }

  // Eliminar espacios en blanco al inicio y al final
  nombreProyecto = nombreProyecto.trim();

  // Validar el nombre del proyecto
  if (!nombreProyecto || nombreProyecto.startsWith(' ')) {
    nombreProyecto = await preguntar('\n\nPor favor, indica el nombre del proyecto: ');
    nombreProyecto = nombreProyecto.trim();

    // Si sigue siendo inválido, mostramos un error y finalizamos
    if (!nombreProyecto || nombreProyecto.startsWith('')) {
      console.error('\n\nNo has colocado un nombre válido. Error 001.\n\n');
      process.exit(1);
    }
  }

  const destino = path.join(process.cwd(), nombreProyecto);

  // Copiar los archivos de la plantilla al nuevo directorio
  fs.copySync(path.join(__dirname, 'plantilla'), destino);

  // Actualizar el nombre en package.json
  const packageJsonPath = path.join(destino, 'package.json');
  const packageJson = fs.readJsonSync(packageJsonPath);
  packageJson.name = nombreProyecto;
  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });

  // Preguntar al usuario si desea instalar las dependencias
  const instalarDeps = await preguntar('\n\n¿Deseas instalar las dependencias ahora? (y/n): ');

  if (instalarDeps.toLowerCase() === 'y') {
    console.log('\n\nInstalando dependencias...');
    execSync('npm install', { cwd: destino, stdio: 'inherit' });
    console.log(`\n\n¡Proyecto "${nombreProyecto}" creado y dependencias instaladas exitosamente!`);
  } else {
    console.log(`\n\n\n¡Proyecto "${nombreProyecto}" creado exitosamente!`);
  }

  // Preguntar si el usuario desea entrar en el directorio y abrir VSCode
  const abrirVSCode = await preguntar('\n\n¿Deseas entrar en el directorio y continuar en VSCode? (y/n): ');

  if (abrirVSCode.toLowerCase() === 'y') {
    // Cambiar al directorio del proyecto
    process.chdir(destino);
    try {
      // Abrir Visual Studio Code
      execSync('code .', { stdio: 'inherit' });
      console.log(`\n\nVSCode se ha abierto en el proyecto "${nombreProyecto}".`);

      // Iniciar cuenta regresiva de 3 segundos antes de cerrar la consola
      console.log('\n\n\nLa consola se cerrará en 3 segundos.');
      let contador = 3;
      const intervalo = setInterval(() => {
        contador--;
        if (contador > 0) {
          console.log(`${contador}...`);
        } else {
          clearInterval(intervalo);
          console.log('\n\nCerrando la consola...');
          
          // Intentar cerrar la consola
          if (process.platform === 'win32') {
            // Comando específico para Windows
            exec('taskkill /F /PID ' + process.pid, (err) => {
              if (err) {
                console.error('\n\nNo se pudo cerrar la consola.');
              }
              process.exit(0);
            });
          } else {
            // En otros sistemas operativos, simplemente salir del proceso
            process.exit(0);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('\n\nNo se pudo abrir VSCode. Asegúrate de que el comando "code" está disponible en tu PATH.');
    }
  } else {
    console.log('\n\nPara continuar, ejecuta los siguientes comandos:');
    console.log(`\ncd ${nombreProyecto}`);
    if (instalarDeps.toLowerCase() !== 'y') {
      console.log('npm install');
    }
    console.log('npm run dev\n\n');
  }
})();
