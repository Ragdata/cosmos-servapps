const fs = require('fs')
const { config } = require('process')
const configFile = require('./config.json')

let servappsJSON = []

let repoURL = configFile.pageUrl;
let servappsFolder = configFile.servappsFolder;

// list all directories in the directory servapps and compile them in servapps.json

const servapps = fs.readdirSync(`./${servappsFolder}`).filter(file => fs.lstatSync(`./${servappsFolder}/${file}`).isDirectory())


for (const file of servapps) {
  const servapp = require(`./${servappsFolder}/${file}/description.json`)
  servapp.id = file
  servapp.screenshots = [];
  servapp.artefacts = {};

  // list all screenshots in the directory servapps/${file}/screenshots
  const screenshots = fs.readdirSync(`./${servappsFolder}/${file}/screenshots`)
  for (const screenshot of screenshots) {
    servapp.screenshots.push(`${repoURL}/${servappsFolder}/${file}/screenshots/${screenshot}`)
  }

  if(fs.existsSync(`./${servappsFolder}/${file}/artefacts`)) {
    const artefacts = fs.readdirSync(`./${servappsFolder}/${file}/artefacts`)
    for(const artefact of artefacts) {
      servapp.artefacts[artefact] = (`${repoURL}/${servappsFolder}/${file}/artefacts/${artefact}`)
    }
  }

  let composeFileName = "cosmos-compose.json";
  if(!fs.existsSync(`./${servappsFolder}/${file}/cosmos-compose.json`)) {
    composeFileName = "docker-compose.yml";
  }
  if(!fs.existsSync(`./${servappsFolder}/${file}/${composeFileName}`)) {
    console.error(`No compose file found for ${file}`);
    continue;
  }

  servapp.icon = `${repoURL}/${servappsFolder}/${file}/icon.png`
  servapp.compose = `${repoURL}/${servappsFolder}/${file}/${composeFileName}`

  servappsJSON.push(servapp)
}

// add showcase
const _sc = ["Jellyfin", "Home Assistant", "Nextcloud"];
const showcases = servappsJSON.filter((app) => _sc.includes(app.name));

let apps = {
  "source": configFile.marketIndexUrl,
  "showcase": showcases,
  "all": servappsJSON
}

fs.writeFileSync('./servapps.json', JSON.stringify(servappsJSON, null, 2))
fs.writeFileSync('./index.json', JSON.stringify(apps, null, 2))

