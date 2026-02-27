/**
 * wav-call-system - 跨平台叫号系统语音播放库
 * @version 1.0.0
 * @description 支持普通叫号和大堂经理叫号的语音播放库
 */

// 导入依赖
const fs = require('fs-extra');
const path = require('path');

// 跨平台支持：尝试导入 wav 和 speaker 模块，失败时提供模拟实现
let wav, Speaker;
let hasRealPlayback = false;

try {
    wav = require('wav');
    Speaker = require('speaker');
    hasRealPlayback = true;
    console.log('✅ 已加载 wav 和 speaker 模块，使用真实播放模式');
} catch (error) {
    console.warn('⚠️ 无法加载 wav 或 speaker 模块，将使用模拟播放模式');
    // 提供模拟实现，确保在任何平台上都能运行
    wav = {
        Reader: function() {
            return {
                on: function(event, callback) {
                    if (event === 'format') {
                        setTimeout(() => callback({}), 50);
                    }
                },
                pipe: function() { return this; }
            };
        }
    };
    Speaker = function() {
        return {
            end: function() {},
            on: function(event, callback) {
                if (event === 'finish') {
                    setTimeout(callback, 100);
                }
            },
            write: function() {},
            pipe: function() { return this; }
        };
    };
}

// ==================== 1. 配置选项 ====================
let config = {
    // 音频文件根目录
    voiceRoot: path.join(process.cwd(), 'Sound/Chinese'),
    // 语音文件映射
    voiceMap: {
        // 数字
        '0': '0.wav',
        '1': '1.wav',
        '2': '2.wav',
        '3': '3.wav',
        '4': '4.wav',
        '5': '5.wav',
        '6': '6.wav',
        '7': '7.wav',
        '8': '8.wav',
        '9': '9.wav',
        // 字母
        'A': 'A.wav',
        'B': 'B.wav',
        'C': 'C.wav',
        'D': 'D.wav',
        'E': 'E.wav',
        'F': 'F.wav',
        'G': 'G.wav',
        'H': 'H.wav',
        'I': 'I.wav',
        'J': 'J.wav',
        'K': 'K.wav',
        'L': 'L.wav',
        'M': 'M.wav',
        'N': 'N.wav',
        'O': 'O.wav',
        'P': 'P.wav',
        'Q': 'Q.wav',
        'R': 'R.wav',
        'S': 'S.wav',
        'T': 'T.wav',
        'U': 'U.wav',
        'V': 'V.wav',
        'W': 'W.wav',
        'X': 'X.wav',
        'Y': 'Y.wav',
        'Z': 'Z.wav',
        // 指令关键词
        '请': 'qing.wav',
        '到': 'dao.wav',
        '号': 'hao.wav',
        '号窗口': 'haochuangkou.wav',
        '大堂经理': 'qingdatangjingliqianwang.wav',
        '号顾客': 'haoguke.wav',
        '预填单机': 'yutiandanji.wav',
        '号柜台': 'haoguitai.wav',
        '自助区': 'zizhuqu.wav',
        '叮咚': 'dingdong.wav'
    },
    // 调试模式
    debug: true
};

// ==================== 2. 播放队列核心配置 ====================
let playQueue = []; // 播放队列：存储待播放的任务 { type: 'normal/manager', params: [...] }
let isPlaying = false; // 当前是否正在播放任务
let currentIndex = 0;
let currentSpeaker = null;

// ==================== 3. 配置方法 ====================
/**
 * 配置库的参数
 * @param {Object} options - 配置选项
 * @param {string} options.voiceRoot - 音频文件根目录
 * @param {Object} options.voiceMap - 语音文件映射
 * @param {boolean} options.debug - 调试模式
 */
function configure(options) {
    if (options) {
        if (options.voiceRoot) {
            config.voiceRoot = path.resolve(options.voiceRoot);
        }
        if (options.voiceMap) {
            config.voiceMap = { ...config.voiceMap, ...options.voiceMap };
        }
        if (typeof options.debug === 'boolean') {
            config.debug = options.debug;
        }
    }
    if (config.debug) {
        console.log('📝 配置已更新:', config);
    }
}

// ==================== 4. 基础播放工具函数 ====================
/**
 * 播放单个 WAV 文件
 * @param {string} filePath - WAV 文件路径
 * @returns {Promise} 播放完成的 Promise
 */
function playSingleWav(filePath) {
    return new Promise((resolve) => {
        const absPath = path.resolve(filePath);

        if (!fs.existsSync(absPath)) {
            if (config.debug) {
                console.warn(`⚠️ 音频文件不存在: ${absPath}，模拟播放完成`);
            }
            resolve();
            return;
        }

        if (config.debug) {
            console.log(`🎵 正在播放: ${path.basename(filePath)}`);
        }

        try {
            const reader = new wav.Reader();
            const fileStream = fs.createReadStream(absPath);

            reader.on('format', (format) => {
                currentSpeaker = new Speaker(format);

                currentSpeaker.on('finish', () => {
                    if (config.debug) {
                        console.log(`🔚 播放完成: ${path.basename(filePath)}`);
                    }
                    resolve();
                });

                currentSpeaker.on('error', (err) => {
                    if (config.debug) {
                        console.error(`❌ 播放出错 [${path.basename(filePath)}]:`, err.message);
                    }
                    resolve(); // 出错时也视为完成
                });

                reader.pipe(currentSpeaker);
            });

            reader.on('error', (err) => {
                if (config.debug) {
                    console.error(`❌ WAV 解析错误 [${path.basename(filePath)}]:`, err.message);
                }
                resolve(); // 出错时也视为完成
            });

            fileStream.on('error', (err) => {
                if (config.debug) {
                    console.error(`❌ 文件读取错误 [${path.basename(filePath)}]:`, err.message);
                }
                resolve(); // 出错时也视为完成
            });

            fileStream.pipe(reader);
        } catch (err) {
            if (config.debug) {
                console.error(`❌ 播放初始化错误 [${path.basename(filePath)}]:`, err.message);
            }
            resolve(); // 出错时也视为完成
        }
    });
}

/**
 * 连续播放 WAV 文件列表（内部使用，不对外暴露）
 * @param {string[]} files - WAV 文件路径列表
 * @returns {Promise} 播放完成的 Promise
 */
async function playAudioSequentially(files) {
    currentIndex = 0;

    while (currentIndex < files.length) {
        try {
            await playSingleWav(files[currentIndex]);
            currentIndex++;
        } catch (err) {
            console.error(`⚠️ 处理音频失败，跳过: ${path.basename(files[currentIndex])} - ${err.message}`);
            currentIndex++;
            continue;
        }
    }

    currentSpeaker = null;
    console.log('✅ 本次叫号语音播放完成！');
}

// ==================== 4. 队列管理核心函数 ====================
/**
 * 消费播放队列：自动执行下一个任务
 */
async function consumeQueue() {
    // 如果正在播放 或 队列为空，直接返回
    if (isPlaying || playQueue.length === 0) {
        return;
    }

    // 标记为播放中
    isPlaying = true;

    // 取出队列第一个任务
    const task = playQueue.shift();
    console.log(`📢 开始执行队列任务: ${JSON.stringify(task)}`);

    try {
        // 根据任务类型执行播放
        switch (task.type) {
            case 'normal':
                await generateNormalVoiceSequence(task.queueNum, task.windowNum, task.withDingDong);
                break;
            case 'manager':
                await generateManagerVoiceSequence(task.windowNum, task.withDingDong);
                break;
            default:
                console.error(`❌ 未知的任务类型: ${task.type}`);
        }
    } catch (err) {
        console.error(`❌ 队列任务执行失败: ${err.message}`);
    } finally {
        // 播放完成，标记为未播放
        isPlaying = false;
        // 自动消费下一个任务
        consumeQueue();
    }
}

/**
 * 生成普通叫号的语音序列（纯函数，不直接播放）
 * @param {string} queueNum - 排队号
 * @param {number|string} windowNum - 窗口号
 * @param {boolean} withDingDong - 是否播放叮咚
 * @returns {Promise}
 */
async function generateNormalVoiceSequence(queueNum, windowNum, withDingDong = true) {
    const voiceSequence = [];

    if (withDingDong) {
        voiceSequence.push(path.join(config.voiceRoot, config.voiceMap['叮咚']));
    }

    voiceSequence.push(path.join(config.voiceRoot, config.voiceMap['请']));
    voiceSequence.push(...parseQueueNum(queueNum));
    voiceSequence.push(path.join(config.voiceRoot, config.voiceMap['号顾客']));
    voiceSequence.push(path.join(config.voiceRoot, config.voiceMap['到']));
    voiceSequence.push(...parseWindowNum(windowNum));
    voiceSequence.push(path.join(config.voiceRoot, config.voiceMap['号窗口']));

    await playAudioSequentially(voiceSequence);
}

/**
 * 生成大堂经理叫号的语音序列（纯函数，不直接播放）
 * @param {number|string} windowNum - 窗口号
 * @param {boolean} withDingDong - 是否播放叮咚
 * @returns {Promise}
 */
async function generateManagerVoiceSequence(windowNum, withDingDong = true) {
    const voiceSequence = [];

    if (withDingDong) {
        voiceSequence.push(path.join(config.voiceRoot, config.voiceMap['叮咚']));
    }

    voiceSequence.push(path.join(config.voiceRoot, config.voiceMap['大堂经理']));
    voiceSequence.push(...parseWindowNum(windowNum));
    voiceSequence.push(path.join(config.voiceRoot, config.voiceMap['号窗口']));

    await playAudioSequentially(voiceSequence);
}

// ==================== 5. 对外暴露的队列操作函数 ====================
/**
 * 添加普通叫号任务到播放队列
 * @param {string} queueNum - 排队号（如 A1001）
 * @param {number|string} windowNum - 窗口号（如 3）
 * @param {boolean} withDingDong - 是否播放叮咚提示音
 */
 function addNormalCallToQueue(queueNum, windowNum, withDingDong = true) {
    // 验证参数
    if (!/^[A-Z]\d{4}$/.test(queueNum)) {
        console.error(`❌ 排队号格式错误: ${queueNum}，必须是 1 个大写字母 + 4 位数字`);
        return;
    }

    // 添加任务到队列
    playQueue.push({
        type: 'normal',
        queueNum,
        windowNum,
        withDingDong
    });

    console.log(`📥 普通叫号任务已加入队列: 请${queueNum}到${windowNum}号窗口，当前队列长度: ${playQueue.length}`);

    // 尝试消费队列
    consumeQueue();
}

/**
 * 添加大堂经理叫号任务到播放队列
 * @param {number|string} windowNum - 窗口号（如 5）
 * @param {boolean} withDingDong - 是否播放叮咚提示音
 */
function addManagerCallToQueue(windowNum, withDingDong = true) {
    // 验证参数
    if (!/^\d{1}$/.test(String(windowNum))) {
        console.error(`❌ 窗口号格式错误: ${windowNum}，必须是 1 位数字`);
        return;
    }

    // 添加任务到队列
    playQueue.push({
        type: 'manager',
        windowNum,
        withDingDong
    });

    console.log(`📥 大堂经理叫号任务已加入队列: 请大堂经理到${windowNum}号窗口，当前队列长度: ${playQueue.length}`);

    // 尝试消费队列
    consumeQueue();
}

/**
 * 获取当前播放队列长度
 * @returns {number} 队列长度
 */
function getQueueLength() {
    return playQueue.length;
}

/**
 * 清空播放队列
 */
function clearPlayQueue() {
    playQueue = [];
    console.log('🗑️ 播放队列已清空');
}

/**
 * 停止当前播放并清空队列
 */
function stopAllPlayback() {
    if (currentSpeaker) {
        currentSpeaker.end();
        currentSpeaker = null;
    }
    isPlaying = false;
    playQueue = [];
    console.log('🛑 已停止当前播放并清空队列');
}

// ==================== 6. 辅助解析函数 ====================
/**
 * 解析排队号为音频路径列表
 * @param {string} queueNum - 排队号
 * @returns {string[]}
 */
function parseQueueNum(queueNum) {
    const voiceFiles = [];
    const chars = queueNum.split('');

    chars.forEach(char => {
        const fileName = config.voiceMap[char];
        if (!fileName) {
            if (config.debug) {
                console.warn(`⚠️ 无对应的语音文件: ${char}，跳过`);
            }
            return;
        }
        voiceFiles.push(path.join(config.voiceRoot, fileName));
    });

    return voiceFiles;
}

/**
 * 解析窗口号为音频路径列表
 * @param {number|string} windowNum - 窗口号
 * @returns {string[]}
 */
function parseWindowNum(windowNum) {
    const windowStr = String(windowNum);
    if (!/^\d{1}$/.test(windowStr)) {
        if (config.debug) {
            console.warn(`⚠️ 窗口号格式错误: ${windowNum}，必须是 1 位数字`);
        }
        return [];
    }

    const voiceFiles = [];
    windowStr.split('').forEach(num => {
        const fileName = config.voiceMap[num];
        if (!fileName) {
            if (config.debug) {
                console.warn(`⚠️ 无对应的数字语音文件: ${num}，跳过`);
            }
            return;
        }
        voiceFiles.push(path.join(config.voiceRoot, fileName));
    });

    return voiceFiles;
}

// ==================== 7. 模块导出 ====================
// 导出对外接口
const WavCallSystem = {
    // 核心功能
    addNormalCallToQueue,
    addManagerCallToQueue,
    getQueueLength,
    clearPlayQueue,
    stopAllPlayback,
    // 配置方法
    configure
};

// CommonJS 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WavCallSystem;
    // 支持 require('wav-call-system') 和 require('wav-call-system').default
    module.exports.default = WavCallSystem;
}

// ES 模块导出（如果支持）
if (typeof exports !== 'undefined' && !exports.default) {
    Object.assign(exports, WavCallSystem);
}

// 浏览器环境导出
if (typeof window !== 'undefined') {
    window.WavCallSystem = WavCallSystem;
}

// ==================== 8. 命令行使用示例 ====================
// 如果直接运行此文件，则执行示例
if (require.main === module) {
    // 示例1：连续添加多个普通叫号任务
    addNormalCallToQueue('A1001', 3); // 第一个任务：立即播放
    // addNormalCallToQueue('B2002', 5); // 第二个任务：加入队列
    // addNormalCallToQueue('C3003', 8); // 第三个任务：加入队列
    //
    // // 示例2：添加大堂经理任务（会排在普通任务之后）
    // setTimeout(() => {
    //     addManagerCallToQueue(2); // 延迟2秒添加，会排在队列末尾
    // }, 2000);
    //
    // // 示例3：查看队列长度
    // setTimeout(() => {
    //     console.log(`当前队列长度: ${getQueueLength()}`);
    // }, 1000);
}
