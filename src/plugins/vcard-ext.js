import fs from 'fs'
import yaml from 'js-yaml'
import vCardsJS from 'vcards-js'
import addPhoneticField from '../utils/pinyin.js'

const plugin = (file, _, cb) => {
  const path = file.path
  const data = fs.readFileSync(path, 'utf8')
  const json = yaml.load(data)

  let vCard = vCardsJS()
  vCard.isOrganization = true
  for (const [key, value] of Object.entries(json.basic)) {
    vCard[key] = value
  }

  if (!vCard.uid) {
    vCard.uid = vCard.organization
  }

  vCard.photo.embedFromFile(path.replace('.yaml', '.png'))
  // 替换 git log 命令相关的代码
  const yamlStats = fs.statSync(path)
  const pngStats = fs.statSync(path.replace('.yaml', '.png'))
  let rev = new Date(Math.max(yamlStats.mtime, pngStats.mtime)).toISOString()

  let formatted = vCard.getFormattedString()
  formatted = formatted.replace(/REV:[\d\-:T\.Z]+/, 'REV:' + rev)
  formatted = addPhoneticField(formatted, 'ORG')
  file.contents = Buffer.from(formatted)
  cb(null, file)
}

export default plugin