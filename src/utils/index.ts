import * as fs from 'fs'
import { parse } from 'node-html-parser'

export const writeToFile = async (
  filename: string,
  data: string | NodeJS.ArrayBufferView
) => {
  return fs.writeFile(filename, data, (error) => {
    if (error) throw error
    console.log(`The file ${filename} has been saved!`)
  })
}

const OUTPUT_FILE = './src/svg/iconsMap.ts'
export const processSVG = async (filename: string, data: string) => {
  try {
    const root = parse(data)
    const pathElements = root.querySelectorAll('path')
    const paths = pathElements
      .map((pathEl) => {
        const fillAttr = pathEl.getAttribute('fill')
        if (fillAttr) {
          pathEl.setAttribute('fill', 'current')
        }
        return pathEl.outerHTML
      })
      .join('')

    const fileContent = fs.readFileSync(OUTPUT_FILE, 'utf8')
    const fileNameWithoutExtension = filename.split('.')[0]
    const svgEntry = `\n  \'${fileNameWithoutExtension}\': \'${paths}\',`
    const updatedContent = fileContent.replace(/}/, `${svgEntry}}`)

    fs.writeFileSync(OUTPUT_FILE, updatedContent, 'utf8')

    console.log(`Appended ${fileNameWithoutExtension} to iconsMap.ts`)
  } catch (error) {
    console.error('Error processing SVG:', error)
  }
}

export const camelCaseToDash = (string: string) => {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export const flattenArray = (arr: any[], d: number = 1) => {
  return d > 0
    ? arr.reduce(
        (acc, val) =>
          acc.concat(Array.isArray(val) ? flattenArray(val, d - 1) : val),
        []
      )
    : arr.slice()
}

export const findAllByValue = (
  obj: { id: string, name: string },
  valueToFind: string
) => {
  return Object.entries(obj).reduce(
    (acc, [key, value]) =>
      value === valueToFind
        ? acc.concat({
            id: Object.values(obj.id).join(''),
            name: Object.values(obj.name).join(''),
          })
        : typeof value === 'object' && value !== null
        ? acc.concat(findAllByValue(value, valueToFind))
        : acc,
    []
  )
}

export const createFolder = async (path: string) => {
  try {
    await fs.promises.access(path, fs.constants.F_OK)
  } catch (err) {
    await fs.promises.mkdir(path)
  }
}

export const filterPrivateComponents = (svgs: any[]) =>
  svgs.filter(({ name }) => !name.startsWith('.') && !name.startsWith('_'))

exports.processSVG = processSVG
exports.writeToFile = writeToFile
exports.camelCaseToDash = camelCaseToDash
exports.flattenArray = flattenArray
exports.findAllByValue = findAllByValue
exports.createFolder = createFolder
exports.filterPrivateComponents = filterPrivateComponents
