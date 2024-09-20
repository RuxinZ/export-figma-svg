import * as fs from 'fs'
import { parse } from 'node-html-parser'
import path from 'path'
import { icons } from '../svg/icons'

function kebabToPascal(str: string) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

export const writeToFile = async (filename: string, data: string) => {
  try {
    const fileNameWithoutExtension = path.basename(filename, '.svg')
    if (icons.includes(fileNameWithoutExtension)) {
      console.log(`${fileNameWithoutExtension} has been imported`)
      return
    }

    const root = parse(data)
    const pathElements = root.querySelectorAll('path')
    const paths = pathElements
      .map((pathEl) => {
        const fillAttr = pathEl.getAttribute('fill')
        if (fillAttr) {
          pathEl.setAttribute('fill', 'currentColor')
        }
        return pathEl.outerHTML
      })
      .join('\n    ')

    const svgElement = root.querySelector('svg')
    const viewBox = svgElement?.getAttribute('viewBox') || '0 0 24 24'
    const [, , viewBoxWidth, viewBoxHeight] = viewBox.split(' ')

    const componentName = kebabToPascal(fileNameWithoutExtension)
    const outputFileName = `${componentName}.svelte`
    const outputPath = path.join('./src/svg/', outputFileName)
    const componentContent = `<script lang="ts">
export let viewBoxWidth = ${viewBoxWidth}
export let viewBoxHeight = ${viewBoxHeight}
</script>

<svg
  class="w-full transition-inherit"
  fill="currentColor"
  viewBox="0 0 {viewBoxWidth} {viewBoxHeight}"
  aria-label="icon-${fileNameWithoutExtension.toLowerCase()}"
  role="img">
  ${paths}
</svg>
`

    fs.writeFileSync(outputPath, componentContent, 'utf8')
    const fileContent = fs.readFileSync('./src/svg/icons.ts', 'utf8')
    const updatedContent = fileContent.replace(
      /]/,
      `\'${fileNameWithoutExtension}\',]`
    )
    fs.writeFileSync('./src/svg/icons.ts', updatedContent, 'utf8')

    console.log(`Created ${outputFileName}`)
  } catch (error) {
    throw new Error(`Error processing SVG ${filename}: ` + error)
  }
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
