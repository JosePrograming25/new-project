#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Función para solicitar el nombre del proyecto al usuario
function pedirNombreProyecto(mensaje) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(mensaje, (respuesta) => {
      rl.close();
      resolve(respuesta);
    });
  });
}

(async () => {
  let nombreProyecto = process.argv[2];

  // Si no se proporciona el nombre del proyecto, lo solicitamos
  if (!nombreProyecto) {
    nombreProyecto = await pedirNombreProyecto('No has indicado qué nombre quieres para tu proyecto: ');
  }

  // Eliminar espacios en blanco al inicio y al final
  nombreProyecto = nombreProyecto.trim();

  // Validar el nombre del proyecto
  if (nombreProyecto.startsWith('') || nombreProyecto === '') {
    nombreProyecto = await pedirNombreProyecto('Por favor, indica el nombre del proyecto: ');
    nombreProyecto = nombreProyecto.trim();

    // Si sigue siendo inválido, mostramos un error y finalizamos
    if (nombreProyecto.startsWith('') || nombreProyecto === '') {
      console.error('No has colocado un nombre válido. Error 001.');
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

  // Instalar las dependencias
  console.log('Instalando dependencias...');
  execSync('npm install', { cwd: destino, stdio: 'inherit' });

  console.log(`\n¡Proyecto "${nombreProyecto}" creado exitosamente!`);
})();
