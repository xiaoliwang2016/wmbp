const sdkConfig = {
    developerID: '1248616587884367872',
    appID: 'aYbHPTmdVlBq',
    secretKey: 'AwsCgBlR41tSkX2M3aqoyGupZdiIbUEQ',
    offlinekey: '/EPF^EvEVx^LShWwRgPXaSzEOtTMWhkzRU^wTvW+WD2SPxW+TGh%?vjqXtS4^vzD/SW*^SsTSF*V^iMuSh*MWFjqL+k?aFPtKwh?XvEqJhP?TES2LDAxIDA=/^='
}

const paths = {
    'm': [ 'https://laozi-auto-east.obs.cn-east-2.myhuaweicloud.com:443/a1f74318-8c32-41ae-9f13-195c2d6a5a4b.json.gz' ],
    'mat': [ 'https://laozi-auto-east.obs.cn-east-2.myhuaweicloud.com:443/UOANoaufzte1khPA6weQ/mat.json.gz' ],
    'scene': 'https://laozi-auto-east.obs.cn-east-2.myhuaweicloud.com:443/cHil1DIIZPvft1SVDj2c/scene.json.gz'
}

const barrierPaths = {
    'm': [ 'https://laozi-auto-east.obs.cn-east-2.myhuaweicloud.com:443/4841dee6-0f38-4cc8-8c15-a9ee1f5ad4e2.json.gz' ],
    'mat': [ 'https://laozi-auto-east.obs.cn-east-2.myhuaweicloud.com:443/0c0b8490-77ab-470b-9242-2c4a9b8d80a2.json.gz' ]
}

const obstacleNames = [ 'Loft028', 'Shape023', 'Loft015', 'Loft024', 'Loft014', '对象028', 'Object851', 'Mat3d66-1072244-12-5442', 'Mat3d66-1072244-9-7891','Mat3d66-1072244-7-4669', 'Mat3d66-1072244-18-9592', 'Mat3d66-1072244-5-2243' ]

//设备部署模板
const deviceData = [
    { src: '/data/image/1.jpg', name: 'Laneindicator', typeName: '车道指示器', typeId: 'T1001' },
    { src: '/data/image/1.jpg', name: 'Winddirection', typeName: '风速风向传感器', typeId: 'T1002' },
    { src: '/data/image/1.jpg', name: 'ZDDZ', typeName: '自动道闸', typeId: 'T1003' },
    { src: '/data/image/1.jpg', name: 'CGJCQ', typeName: '超高检测器', typeId: 'T1004' },
    { src: '/data/image/1.jpg', name: 'Covidetector', typeName: 'CO/VI 检测仪', typeId: 'T1005' },
    { src: '/data/image/1.jpg', name: 'JTXHD', typeName: '交通信号灯', typeId: 'T1006' },
    { src: '/data/image/1.jpg', name: 'Jetfan', typeName: '射流风机', typeId: 'T1008' },
    { src: '/data/image/1.jpg', name: 'Rollingshutterdoor', typeName: '横通道卷帘门', typeId: 'T1009' },
    { src: '/data/image/1.jpg', name: 'WSDJCQ', typeName: '温湿度监测器', typeId: 'T1010' },
    { src: '/data/image/1.jpg', name: 'Firealarm', typeName: '火灾报警', typeId: 'T1012' },
    { src: '/data/image/1.jpg', name: 'CSBYWY', typeName: '超声波液位仪', typeId: 'T1013' },
    { src: '/data/image/1.jpg', name: 'FSB', typeName: '废水泵', typeId: 'T1015' },
    { src: '/data/image/1.jpg', name: 'DDTJF', typeName: '电动调节阀', typeId: 'T1016' },
    { src: '/data/image/1.jpg', name: 'ZHDDFF', typeName: '电动组合风阀', typeId: 'T1017' },
    { src: '/data/image/1.jpg', name: '70DFHF', typeName: '70℃防烟防火阀', typeId: 'T1018' },
    { src: '/data/image/1.jpg', name: 'telephonehost', typeName: '紧急电话', typeId: 'T2001' },
    { src: '/data/image/1.jpg', name: 'Vehicledetector', typeName: '车辆检测器', typeId: 'T3001' },
    { src: '/data/image/1.jpg', name: 'Variableinformationboard', typeName: '可变情报板', typeId: 'T3002' },
    { src: '/data/image/1.jpg', name: 'Variablespeedlimitsign', typeName: '可变限速板', typeId: 'T3003' },
    { src: '/data/image/1.jpg', name: 'Networkguncamera', typeName: '视频监控', typeId: 'T3004' }
]

//可以检测到的设备
const deviceNames = [
    'Laneindicator',
    'Winddirection',
    'ZDDZ',
    'CGJCQ',
    'Covidetector',
    'JTXHD',
    'Jetfan',
    'Rollingshutterdoor',
    'WSDJCQ',
    'Firealarm',
    'CSBYWY',
    'FSB',
    'DDTJF',
    'ZHDDFF',
    '70DFHF',
    'telephonehost',
    'Vehicledetector',
    'Variableinformationboard',
    'Variablespeedlimitsign',
    'Audible',
    'Networkguncamera',
    'controller',
    'speaker',
    'Sphericalcamera',
    'HDvideoremote',
    'Areacontrolunit'
]

//独立加载的模型
const independModels = [
    'ZDDZ'
]


export {
    sdkConfig,
    paths,
    barrierPaths,
    obstacleNames,
    deviceData,
    deviceNames,
    independModels
}
