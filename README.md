# wav-call-system

跨平台叫号系统语音播放库，支持普通叫号和大堂经理叫号的语音播放功能。

## 特性

- ✅ 跨平台支持（Windows、macOS、Linux）
- ✅ 支持普通叫号和大堂经理叫号
- ✅ 播放队列管理
- ✅ 配置灵活，支持自定义音频路径
- ✅ 错误处理完善，确保系统稳定运行
- ✅ 支持多种音频文件格式

## 安装

```bash
# 使用 npm 安装
npm install wav-call-system

# 使用 yarn 安装
yarn add wav-call-system
```

## 基本使用

### 1. 引入库

```javascript
// CommonJS 引入
const WavCallSystem = require('wav-call-system');

// ES 模块引入
import WavCallSystem from 'wav-call-system';
```

### 2. 配置（可选）

```javascript
// 配置音频文件路径和其他选项
WavCallSystem.configure({
    // 音频文件根目录
    voiceRoot: './Sound/Chinese',
    // 调试模式
    debug: true
});
```

### 3. 调用叫号功能

```javascript
// 添加普通叫号任务
WavCallSystem.addNormalCallToQueue('A1001', 3);

// 添加大堂经理叫号任务
WavCallSystem.addManagerCallToQueue(2);

// 查看队列长度
console.log('当前队列长度:', WavCallSystem.getQueueLength());

// 清空播放队列
WavCallSystem.clearPlayQueue();

// 停止当前播放并清空队列
WavCallSystem.stopAllPlayback();
```

## API 文档

### 配置方法

#### `configure(options)`
- **options.voiceRoot**: 音频文件根目录，默认为 `./Sound/Chinese`
- **options.voiceMap**: 语音文件映射，可自定义
- **options.debug**: 调试模式，默认为 `true`

### 核心方法

#### `addNormalCallToQueue(queueNum, windowNum, withDingDong)`
- **queueNum**: 排队号（如 'A1001'）
- **windowNum**: 窗口号（如 3）
- **withDingDong**: 是否播放叮咚提示音，默认为 `true`

#### `addManagerCallToQueue(windowNum, withDingDong)`
- **windowNum**: 窗口号（如 2）
- **withDingDong**: 是否播放叮咚提示音，默认为 `true`

#### `getQueueLength()`
- 返回当前播放队列长度

#### `clearPlayQueue()`
- 清空播放队列

#### `stopAllPlayback()`
- 停止当前播放并清空队列

## 目录结构

```
wav-call-system/
├── src/
│   └── index.js          # 核心代码
├── Sound/
│   ├── Chinese/          # 中文语音文件
│   ├── English/          # 英文语音文件
│   └── YueYu/            # 粤语语音文件
├── package.json          # 项目配置
├── README.md             # 项目文档
└── LICENSE               # 许可证文件
```

## 音频文件格式

音频文件需要放在 `Sound/Chinese` 目录下（或通过 `configure` 方法自定义路径），文件命名如下：

- 数字：0.wav, 1.wav, ..., 9.wav
- 字母：A.wav, B.wav, ..., Z.wav
- 指令：qing.wav (请), dao.wav (到), haoguke.wav (号顾客), haochuangkou.wav (号窗口), etc.

## 示例

### 示例 1：连续添加多个叫号任务

```javascript
const WavCallSystem = require('wav-call-system');

// 配置音频路径
WavCallSystem.configure({
    voiceRoot: './Sound/Chinese'
});

// 添加多个叫号任务
WavCallSystem.addNormalCallToQueue('A1001', 3); // 立即播放
WavCallSystem.addNormalCallToQueue('B2002', 5); // 加入队列
WavCallSystem.addNormalCallToQueue('C3003', 8); // 加入队列

// 添加大堂经理任务
setTimeout(() => {
    WavCallSystem.addManagerCallToQueue(2);
}, 2000);

// 查看队列长度
setTimeout(() => {
    console.log('当前队列长度:', WavCallSystem.getQueueLength());
}, 1000);
```

### 示例 2：自定义配置

```javascript
const WavCallSystem = require('wav-call-system');

// 自定义配置
WavCallSystem.configure({
    // 自定义音频文件路径
    voiceRoot: '/path/to/your/sound/files',
    // 自定义语音映射
    voiceMap: {
        '0': 'zero.wav',
        '1': 'one.wav',
        // 其他映射...
    },
    // 关闭调试模式
    debug: false
});

// 使用自定义配置
WavCallSystem.addNormalCallToQueue('A1001', 3);
```

## 注意事项

1. 确保音频文件存在于指定路径
2. 支持的 Node.js 版本：12.0.0 及以上
3. 在 Windows 系统上可能需要额外的音频驱动支持
4. 如需在浏览器环境使用，需要额外的 Web Audio API 支持

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
