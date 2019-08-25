const os = require('os');
const io = require('socket.io-client');
let socket = io('http://127.0.0.1:8181');

socket.on('connect', () => {
  // console.log('i connected to socket')
  const networkInterface = os.networkInterfaces();
  let macA; 

  for(let key in networkInterface) {


    // testing
    macA = Math.floor(Math.random() * 3) + 1;
    break; 


    if(!networkInterface.internal) {
      if(networkInterface[key][0].mac === '00:00:00:00:00:00') {
        macA = Math.random().toString(36).substring(2, 15);
      } else {
        macA = networkInterface[key][0].mac;
        break;
      }
    }
  }

    performanceData().then((allPerformanceData) => {
      allPerformanceData.macA = macA;
      socket.emit('initPerfData', allPerformanceData)
    });
  

  let perfDataInterval = setInterval(() => {
    performanceData().then((allPerformanceData) => {
      allPerformanceData.macA = macA;
      socket.emit('perfData', allPerformanceData);
    })
  }, 1000)

  socket.on('disconnect', () => {
    clearInterval(perfDataInterval);
  })

})

function performanceData() {
  return new Promise(async (resolve, reject) => {
    //os info
    const cpus = os.cpus();
    const osType = os.type() == 'Darwin' ? 'Mac' : os.type();
    const upTime = os.uptime();

    // memory info
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;
    const memUseage = Math.floor(usedMem / totalMem * 100) / 100;

    // cpu info 
    const cpuModel = cpus[0].model;
    const numCores = cpus.length;
    const cpuSpeed = cpus[0].speed;

    const cpuLoad = await getCpuLoad();
    const isActive = true;

    resolve({
      freeMem, 
      totalMem, 
      usedMem, 
      memUseage,
      osType,
      upTime,
      cpuModel,
      numCores,
      cpuSpeed,
      cpuLoad,
      isActive
    })
  })
}


function cpuAverage() {
  const cpus = os.cpus();

  let idleMs = 0;
  let totalMs = 0;

  cpus.forEach((core) => {
    for (type in core.times) {
      totalMs += core.times[type];
    }
    idleMs += core.times.idle;
  })

  return {
    idle: idleMs / cpus.length,
    total: totalMs / cpus.length
  }
}

function getCpuLoad() {
  return new Promise((resolve, reject) => {
    const start = cpuAverage();
    setTimeout(() => {
      const end = cpuAverage();
      const idleDifference = end.idle - start.idle;
      const totalDifference = end.total - start.total;
      const percentageCpu = 100 - Math.floor(100 * idleDifference / totalDifference);
      resolve(percentageCpu);
    }, 100)
  })
}
