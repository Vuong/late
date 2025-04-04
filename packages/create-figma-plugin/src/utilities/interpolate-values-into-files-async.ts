import fs from 'node:fs/promises'
import { join } from 'node:path'

import { writeFileAsync } from '@create-figma-plugin/common'
import { globby } from 'globby'
import isUtf8 from 'is-utf8'
import lodashTemplate from 'lodash.template'

let interpolateRegex = /<%=([\s\S]+?)%>/g

export async function interpolateValuesIntoFilesAsync(
  directory: string,
  values: Record<string, any>
): Promise<void> {
  let filePaths = await globby('**/*', {
    cwd: directory,
    dot: true
  })
  await Promise.all(
    filePaths.map(async function (filePath): Promise<void> {
      let absolutePath = join(directory, filePath)
      let buffer = await fs.readFile(absolutePath)
      let fileContents = isUtf8(buffer)
        ? lodashTemplate(buffer.toString(), { interpolate: interpolateRegex })(
            values
          )
        : buffer
      await writeFileAsync(absolutePath, fileContents)
    })
  )
}
