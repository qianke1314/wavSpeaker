// 测试 wav-call-system 库
const WavCallSystem = require('./src/index.js');

console.log('=== 测试 wav-call-system 库 ===\n');

// 测试 1: 配置库
console.log('1. 测试配置功能');
WavCallSystem.configure({
    debug: true
});
console.log('✅ 配置测试完成\n');

// 测试 2: 添加普通叫号任务
console.log('2. 测试普通叫号功能');
WavCallSystem.addNormalCallToQueue('A1001', 3);
console.log('✅ 普通叫号测试完成\n');

// 测试 3: 查看队列长度
console.log('3. 测试队列长度');
const queueLength = WavCallSystem.getQueueLength();
console.log(`当前队列长度: ${queueLength}`);
console.log('✅ 队列长度测试完成\n');

// 测试 4: 清空队列
console.log('4. 测试清空队列');
WavCallSystem.clearPlayQueue();
console.log('✅ 清空队列测试完成\n');

// 测试 5: 再次查看队列长度
console.log('5. 再次测试队列长度');
const newQueueLength = WavCallSystem.getQueueLength();
console.log(`当前队列长度: ${newQueueLength}`);
console.log('✅ 队列长度测试完成\n');

console.log('=== 所有测试完成 ===');
