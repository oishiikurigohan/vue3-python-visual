<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPlay, mdiStop, mdiDelete, mdiLanguagePython } from '@mdi/js'

const worker = ref<Worker | null>()
const workerResult = ref()

/*
const script = `
  import statistics
  from js import A_rank
  statistics.stdev(A_rank)
`
*/
/*
const script = `
  import matplotlib
  import math
  import numpy as np
  from matplotlib import pyplot
  pyplot.hist(np.random.normal(0,1,1000))
  pyplot.show()
`
*/
/*
const script = `
import matplotlib.pyplot as plt
import numpy as np

plt.style.use('_mpl-gallery')

x = [1, 1, 2, 2]
y = [1, 2, 1, 2]
z = [0, 0, 0, 0]
dx = np.ones_like(x)*0.5
dy = np.ones_like(x)*0.5
dz = [2, 3, 1, 4]

fig, ax = plt.subplots(subplot_kw={"projection": "3d"})
ax.bar3d(x, y, z, dx, dy, dz)

ax.set(xticklabels=[],
       yticklabels=[],
       zticklabels=[])

plt.show()
`
*/
const script = `
import matplotlib.pyplot as plt
import numpy as np

print("HELLO!!?")

# データの準備
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)
y3 = np.tan(x)

# サブプロットの作成 (2行2列の配置)
fig, axs = plt.subplots(2, 2, figsize=(10, 8))

# 各サブプロットにデータを描画
axs[0, 0].plot(x, y1, 'r')
axs[0, 0].set_title('Sine Wave')

axs[0, 1].plot(x, y2, 'g')
axs[0, 1].set_title('Cosine Wave')

axs[1, 0].plot(x, y3, 'b')
axs[1, 0].set_title('Tangent Wave')
axs[1, 0].set_ylim(-10, 10)  # y軸の範囲を制限

# 空のサブプロットにタイトルを設定（必要に応じて）
axs[1, 1].axis('off')  # このサブプロットは空にする

# グラフのレイアウトを調整
plt.tight_layout()
plt.show()
`

const context = {
  A_rank: [0.8, 0.4, 1.2, 3.7, 2.6, 5.8],
  B_rank: [1.0, 0.5, 1.1, 3.4, 2.5, 6.0]
}

const startWorker = async () => {
  if (worker.value) return
  console.log('worker start!')
  worker.value = new Worker(new URL('@/workers/WebWorker.ts', import.meta.url), { type: 'module' })
  worker.value.onmessage = (event) => {
    workerResult.value = event.data
    console.log('end worker.')
  }
  worker.value.postMessage({ script, context })
}
const stopWorker = () => {
  if (!worker.value) return
  worker.value.terminate()
  worker.value = null
  console.log('Worker has been terminated.')
}
</script>

<template>
  <div class="resizable">
    <el-card class="visual-card">
      <template #header>
        <div class="card-header">
          <span style="margin-right: auto">python visual</span>
          <el-button link type="primary" size="small" title="pythonファイルのインポート">
            <svg-icon type="mdi" :path="mdiLanguagePython" />
          </el-button>
          <el-button link type="primary" size="small" title="クリア">
            <svg-icon type="mdi" :path="mdiDelete" />
          </el-button>
          <el-button link type="primary" size="small" title="実行" @click="startWorker">
            <svg-icon type="mdi" :path="mdiPlay" />
          </el-button>
          <el-button link type="primary" size="small" title="停止" @click="stopWorker">
            <svg-icon type="mdi" :path="mdiStop" />
          </el-button>
        </div>
      </template>
      <div v-html="workerResult" class="card-body"></div>
      <div id="target"></div>
    </el-card>
  </div>
</template>

<style scoped>
.resizable {
  width: 350px;
  height: 350px;
  border: none;
  overflow: auto;
  resize: both;
}
.visual-card {
  --el-card-padding: 10px;
  width: 95%;
  height: 95%;
}
.card-header {
  display: flex !important;
  justify-content: flex-end;
}
.card-body {
  background-color: pink;
  width: 100%;
  height: calc(100% - 40px);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
