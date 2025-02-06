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
    nombreProyecto = await preguntar('\n\nNombre de proyecto: ');
  }

  // Eliminar espacios en blanco al inicio y al final
  nombreProyecto = nombreProyecto.trim();

  // Validar el nombre del proyecto
  if (!nombreProyecto || nombreProyecto.startsWith('')) {
    nombreProyecto = await preguntar('\n\nPor favor, indica el nombre del proyecto: ');
    nombreProyecto = nombreProyecto.trim();

    // Si sigue siendo inválido, mostramos un error y finalizamos
    if (!nombreProyecto || nombreProyecto.startsWith('')) {
      console.error('No has colocado un nombre válido. Error 001.\n\n');
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
    console.log('Instalando dependencias...');
    execSync('npm install', { cwd: destino, stdio: 'inherit' });
    console.log(`\n¡Proyecto "${nombreProyecto}" creado y dependencias instaladas exitosamente!`);
  } else {
    console.log(`\n¡Proyecto "${nombreProyecto}" creado exitosamente!`);
    console.log('Para continuar, ejecuta los siguientes comandos:');
    console.log(`\n\ncd ${nombreProyecto}`);
    console.log('\n\nnpm install');
    console.log('\n\nnpm run dev\n\n');
  }
})();
