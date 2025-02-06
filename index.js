#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Función para solicitar input del usuario
function preguntar(mensaje) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(mensaje, (respuesta) => {
      rl.close();
      resolve(respuesta.trim());
    });
  });
}

(async () => {
  let nombreProyecto = process.argv[2];

  // Solicitar el nombre del proyecto si no se proporcionó
  if (!nombreProyecto || nombreProyecto.trim() === ' ') {
    nombreProyecto = await preguntar('\nNombre del proyecto: ');
    nombreProyecto = nombreProyecto.trim();
  }

  // Validar el nombre del proyecto
  if (nombreProyecto === ' ') {
    console.error('\nNo has colocado un nombre válido. Error 001.\n');
    process.exit(1);
  }

  const destino = path.join(process.cwd(), nombreProyecto);

  // Copiar los archivos de la plantilla al nuevo directorio
  fs.copySync(path.join(__dirname, 'plantilla'), destino);

  // Actualizar el nombre en package.json
  const packageJsonPath = path.join(destino, 'package.json');
  const packageJson = fs.readJsonSync(packageJsonPath);
  packageJson.name = nombreProyecto;
  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });

  // Preguntar si desea instalar las dependencias
  const instalarDeps = await preguntar('\n¿Deseas instalar las dependencias ahora? (y/n): ');

  if (instalarDeps.toLowerCase() === 'y') {
    console.log('Instalando dependencias...');
    execSync('npm install', { cwd: destino, stdio: 'inherit' });
    console.log(`\n¡Proyecto "${nombreProyecto}" creado y dependencias instaladas exitosamente!`);
  } else {
    console.log(`\n¡Proyecto "${nombreProyecto}" creado exitosamente!`);
  }

  // Preguntar si desea abrir VSCode y cerrar la consola
  const abrirVSCode = await preguntar('\n¿Deseas entrar en el directorio y abrir VSCode? (y/n): ');

  // Variable para indicar si se debe cerrar la consola
  let cerrarConsola = false;

  if (abrirVSCode.toLowerCase() === 'y') {
    // Cambiar al directorio del proyecto
    process.chdir(destino);
    try {
      // Abrir Visual Studio Code
      execSync('code .', { stdio: 'inherit' });
      console.log(`\nVSCode se ha abierto en el proyecto "${nombreProyecto}".`);
      cerrarConsola = true; // Indicamos que se debe cerrar la consola
    } catch (error) {
      console.error('\nNo se pudo abrir VSCode. Asegúrate de que el comando "code" está disponible en tu PATH.');
    }

    // Informar al usuario que puede cerrar la consola
    console.log('\n\nPuedes cerrar esta ventana de la consola si ya no la necesitas.');
  } else {
    console.log('Para continuar, ejecuta los siguientes comandos:');
    console.log(`\ncd ${nombreProyecto}`);
    if (instalarDeps.toLowerCase() !== 'y') {
      console.log('npm install');
    }
    console.log('npm run dev');
  }

  // Escribir el archivo de bandera para indicar si se debe cerrar la consola
  const flagValue = cerrarConsola ? '1' : '0';
  fs.writeFileSync('close_flag.txt', flagValue, 'utf-8');

  process.exit(0);
})();
