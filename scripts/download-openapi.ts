/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import fs from 'fs';

async function processOpenAPI() {
  try {
    // 取得 OpenAPI JSON
    const response = await axios.get('http://localhost:23745/openapi.json'); // 替換為正確的 URL
    const openapiContent = response.data;

    // 遍歷 paths 並修改 operationId
    for (const pathData of Object.values(openapiContent.paths)) {
      for (const operation of Object.values(pathData as any)) {
        const operationTyped = operation as { tags: string[], operationId: string };
        const tag = operationTyped.tags[0] as string;
        const operationId: string = operationTyped.operationId;
        const toRemove = `${tag}-`;

        if (operationId.startsWith(toRemove)) {
          operationTyped.operationId = operationId.slice(toRemove.length);
        }
      }
    }

    // 將修改後的 JSON 寫入文件
    fs.writeFileSync('openapi.json', JSON.stringify(openapiContent, null, 2), { encoding: 'utf8' });

    console.log('OpenAPI JSON processed and saved successfully.');
  } catch (error) {
    console.error('Error processing OpenAPI JSON:', error);
  }
}

// 執行函式
// eslint-disable-next-line @typescript-eslint/no-floating-promises
processOpenAPI();
