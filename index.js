#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Obtener el nombre del proyecto desde los argumentos
const nombreProyecto = process.argv[2];

if (!nombreProyecto) {
  console.error('Por favor, proporciona un nombre para el proyecto:');
  console.error('  npx tu-paquete-npm nombre-del-proyecto');
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

// Instalar las dependencias
console.log('Instalando dependencias...');
execSync('npm install', { cwd: destino, stdio: 'inherit' });

console.log(`\n¡Proyecto "${nombreProyecto}" creado exitosamente!`);
