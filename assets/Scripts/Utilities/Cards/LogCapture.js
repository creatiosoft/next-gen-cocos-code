cc.Class({
	extends: cc.Component,

	properties: {},

	onLoad: function() {
		(function() {
			if (window.__LOG_CAPTURE_INSTALLED__) return;
			window.__LOG_CAPTURE_INSTALLED__ = true;

			const logs = [];
			const MAX_LOGS = 30000; // 内存最多保留条数
			const MAX_DEPTH = 6; // 对象序列化最大深度
			const FLUSH_INTERVAL = 5000; // Native 自动刷盘间隔（毫秒）
			const LOG_FILE_NAME = 'game_console.log';

			// 平台判断
			const isNative = typeof jsb !== 'undefined' && !!jsb.fileUtils;
			const isIOS = isNative && cc.sys.os === cc.sys.OS_IOS;
			const isAndroid = isNative && cc.sys.os === cc.sys.OS_ANDROID;

			let logFilePath = '';
			let lastFlushIndex = 0;

			// ========== 安全序列化（循环引用 + 深度限制） ==========
			function safeStringify(value, depth = 0, seen = new WeakSet()) {
				if (value === null || value === undefined) return String(value);

				const type = typeof value;
				if (type === 'string') return value;
				if (type === 'number' || type === 'boolean' || type === 'bigint') return String(value);
				if (type === 'symbol') return value.toString();
				if (type === 'function') return `[Function: ${value.name || 'anonymous'}]`;

				if (value instanceof Error) {
					return value.stack || (value.name + ': ' + value.message);
				}

				// Cocos 对象精简
				if (typeof cc !== 'undefined') {
					if (value instanceof cc.Node) {
						const pos = value.getPosition ? value.getPosition() : {
							x: value.x,
							y: value.y
						};
						return `[Node "${value.name}" active=${value.active} pos=(${Number(pos.x).toFixed(1)},${Number(pos.y).toFixed(1)}) children=${value.childrenCount}]`;
					}
					if (value instanceof cc.Component) {
						return `[Component ${value.constructor?.name || 'Unknown'} on "${value.node?.name || 'null'}"]`;
					}
					if (value instanceof cc.Scene) return `[Scene "${value.name}"]`;
					if (value instanceof cc.Asset) return `[Asset ${value.constructor?.name || 'Asset'}]`;
					if (value instanceof cc.Color) return `Color(${value.r},${value.g},${value.b},${value.a})`;
					if (value instanceof cc.Vec2) return `Vec2(${value.x},${value.y})`;
					if (value instanceof cc.Vec3) return `Vec3(${value.x},${value.y},${value.z})`;
				}

				if (depth >= MAX_DEPTH) return '[Max Depth]';

				if (typeof value === 'object') {
					if (seen.has(value)) return '[Circular]';
					seen.add(value);
				}

				if (Array.isArray(value)) {
					if (value.length > 30) {
						const preview = value.slice(0, 12).map(v => safeStringify(v, depth + 1, seen));
						return `[Array(${value.length}) ${preview.join(', ')} ... +${value.length - 12} more]`;
					}
					return '[' + value.map(v => safeStringify(v, depth + 1, seen)).join(', ') + ']';
				}

				// ========== 普通对象 / 类实例 ==========
				try {
					let keys = Object.keys(value);

					// 补充不可枚举属性
					try {
						const names = Object.getOwnPropertyNames(value);
						keys = Array.from(new Set([...keys, ...names]));
					} catch (e) {}

					// 强制把业务关键字段加进来（解决 getter / Proxy 导致拿不到的问题）
					const forceKeys = [
						'tourData', 'gameData', 'tableDetails', 'roomConfig',
						'players', 'playerId', 'playerName', 'tournamentId',
						'channelId', 'tableId', 'success', 'err', 'settings',
						'rebuy', 'addOn', 'break', 'agoraToken'
					];

					forceKeys.forEach(fk => {
						if (fk in value && keys.indexOf(fk) === -1) {
							keys.unshift(fk); // 放到最前面
						}
					});

					// 过滤
					keys = keys.filter(k => {
						if (k === 'raw') return false; // 跳过 raw
						if (typeof value[k] === 'function') return false;
						return true;
					});

					// 排序：重要字段优先
					const priority = [
						'tourData', 'gameData', 'tableDetails', 'roomConfig',
						'players', 'success', 'err', 'playerId', 'playerName',
						'tournamentId', 'channelId', 'tableId'
					];
					keys.sort((a, b) => {
						const ai = priority.indexOf(a);
						const bi = priority.indexOf(b);
						if (ai === -1 && bi === -1) return 0;
						if (ai === -1) return 1;
						if (bi === -1) return -1;
						return ai - bi;
					});

					if (keys.length === 0) {
						const ctor = value.constructor?.name;
						return ctor && ctor !== 'Object' ? `[${ctor}]` : '{}';
					}

					const maxKeys = 120;
					const showKeys = keys.slice(0, maxKeys);
					const pairs = [];

					for (let i = 0; i < showKeys.length; i++) {
						const k = showKeys[i];
						let v;
						try {
							// 用 try-catch 保护每个属性的访问
							const rawValue = value[k];
							v = safeStringify(rawValue, depth + 1, seen);
						} catch (err) {
							v = '[Access Error]';
						}
						pairs.push(`"${k}": ${v}`);
					}

					let prefix = '';
					const ctorName = value.constructor?.name;
					if (ctorName && ctorName !== 'Object') {
						prefix = ctorName + ' ';
					}

					let result = prefix + '{' + pairs.join(', ');
					if (keys.length > maxKeys) {
						result += `, ... +${keys.length - maxKeys} more`;
					}
					result += '}';
					return result;

				} catch (e) {
					return Object.prototype.toString.call(value);
				}
			}

			// ========== 拦截 console ==========
			const original = {
				log: console.log.bind(console),
				info: console.info.bind(console),
				warn: console.warn.bind(console),
				error: console.error.bind(console),
				debug: console.debug.bind(console)
			};

			function capture(level, args) {
				const time = new Date().toISOString().replace('T', ' ').substring(0, 23);
				const msg = Array.prototype.map.call(args, arg => safeStringify(arg)).join(' ');
				logs.push(`[${time}] [${level}] ${msg}`);

				// 防止内存无限增长
				if (logs.length > MAX_LOGS) {
					const removeCount = logs.length - MAX_LOGS;
					logs.splice(0, removeCount);
					lastFlushIndex = Math.max(0, lastFlushIndex - removeCount);
				}

				// 继续输出到原 console（Xcode / Logcat / Chrome 都能看到）
				original[level.toLowerCase()].apply(console, args);
			}

			console.log = function() {
				capture('LOG', arguments);
			};
			console.info = function() {
				capture('INFO', arguments);
			};
			console.warn = function() {
				capture('WARN', arguments);
			};
			console.error = function() {
				capture('ERROR', arguments);
			};
			console.debug = function() {
				capture('DEBUG', arguments);
			};

			// 未捕获异常
			window.addEventListener('error', function(e) {
				capture('UNCAUGHT', [
					e.message,
					(e.filename || '') + ':' + e.lineno + ':' + e.colno,
					e.error
				]);
			});
			window.addEventListener('unhandledrejection', function(e) {
				capture('UNHANDLED_REJECTION', [e.reason]);
			});

			// ========== Native 文件操作 ==========
			function getLogFilePath() {
				if (!isNative) return '';
				if (!logFilePath) {
					logFilePath = jsb.fileUtils.getWritablePath() + LOG_FILE_NAME;
				}
				return logFilePath;
			}

			function flushToFile(forceAll = false) {
				if (!isNative) return;

				const path = getLogFilePath();
				const start = forceAll ? 0 : lastFlushIndex;
				if (start >= logs.length) return;

				const newContent = logs.slice(start).join('\n') + '\n';
				lastFlushIndex = logs.length;

				try {
					let oldContent = '';
					if (jsb.fileUtils.isFileExist(path)) {
						oldContent = jsb.fileUtils.getStringFromFile(path) || '';
					}
					jsb.fileUtils.writeStringToFile(oldContent + newContent, path);
				} catch (e) {
					original.error.call(console, '[LogCapture] 写文件失败:', e);
				}
			}

			// Native 下定时自动刷盘 + 切后台时强制刷一次
			if (isNative) {
				setInterval(() => flushToFile(false), FLUSH_INTERVAL);

				if (cc && cc.game) {
					cc.game.on(cc.game.EVENT_HIDE, function() {
						flushToFile(true);
					});
				}
			}

			// ========== 对外接口 ==========
			/**
				* 保存日志
				* @param {string|null} filter   过滤字符串，例如 '[Reshuffle]'，传 null/空/undefined 表示全部
				* @param {string} [customName]  自定义文件名（Native 有效）
				* @returns {string|null}        返回文件路径（Native）或下载文件名（Web）
				*/
			window.saveGameLogs = function(filter, customName) {
				let target = logs;

				if (typeof filter === 'string' && filter.length > 0) {
					target = logs.filter(line => line.indexOf(filter) !== -1);
				}

				if (target.length === 0) {
					original.warn.call(console, `[LogCapture] 没有匹配到包含 "${filter || ''}" 的日志`);
					return null;
				}

				const content = target.join('\n');

				// ---------- Native（iOS + Android） ----------
				if (isNative) {
					flushToFile(true);

					if (filter) {
						const safeName = (customName || `game_console_filter_${filter.replace(/[^\w\-\[\]]/g, '_')}.log`);
						const filterPath = jsb.fileUtils.getWritablePath() + safeName;
						jsb.fileUtils.writeStringToFile(content, filterPath);
						original.log.call(console, `[LogCapture] 已保存过滤日志 (${target.length}条) → ${filterPath}`);
						return filterPath;
					} else {
						const path = getLogFilePath();
						original.log.call(console, `[LogCapture] 已保存全部日志 (${target.length}条) → ${path}`);
						return path;
					}
				}

				// ---------- Web ----------
				const name = customName ||
					(filter ?
						`game-logs-filter-${filter.replace(/[^\w\-\[\]]/g, '_')}.txt` :
						`game-logs-${Date.now()}.txt`);

				const blob = new Blob([content], {
					type: 'text/plain;charset=utf-8'
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = name;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);

				original.log.call(console, `[LogCapture] Web 已下载 ${target.length} 条日志 → ${name}`);
				return name;
			};

			// 兼容旧名字
			window.downloadGameLogs = window.saveGameLogs;

			window.clearGameLogs = function() {
				logs.length = 0;
				lastFlushIndex = 0;

				if (isNative) {
					const path = getLogFilePath();
					if (jsb.fileUtils.isFileExist(path)) {
						jsb.fileUtils.removeFile(path);
					}
				}
				original.log.call(console, '[LogCapture] 日志已清空');
			};

			window.getGameLogPath = function() {
				return isNative ? getLogFilePath() : null;
			};

			window.getGameLogs = function() {
				return logs.slice();
			};

			// ========== 摇一摇 + 分享 ==========
			let lastShakeTime = 0;
			const SHAKE_THRESHOLD = 2.8; // 摇动灵敏度（越大越难触发）
			const SHAKE_COOLDOWN = 2500; // 冷却时间（毫秒）

			function onDeviceMotion(event) {
				if (!isNative) return;

				const acc = event.acc;
				const acceleration = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
				const force = Math.abs(acceleration - 1.0);

				if (force > SHAKE_THRESHOLD) {
					const now = Date.now();
					if (now - lastShakeTime > SHAKE_COOLDOWN) {
						lastShakeTime = now;
						original.log.call(console, '[LogCapture] 检测到摇一摇，准备上报日志');
						reportLogsByShake();
					}
				}
			}

			function reportLogsByShake() {
				// 先强制刷盘
				if (isNative) {
					flushToFile(true);
				}

				const path = getLogFilePath();
				if (!path || !jsb.fileUtils.isFileExist(path)) {
					original.warn.call(console, '[LogCapture] 日志文件不存在，无法分享');
					return;
				}

				shareLogFile(path);
			}

			function shareLogFile(filePath) {
				if (isIOS) {
					jsb.reflection.callStaticMethod(
						"LogShareHelper",
						"shareLogFile:",
						filePath
					);
				} else if (isAndroid) {
					// Android 预留（需要你自己在 Java 里实现 shareLogFile 方法）
					try {
						jsb.reflection.callStaticMethod(
							"org/cocos2dx/javascript/AppActivity",
							"shareLogFile",
							"(Ljava/lang/String;)V",
							filePath
						);
					} catch (e) {
						original.warn.call(console, '[LogCapture] Android 分享方法未实现', e);
					}
				}
			}

			// 开启重力感应（仅 Native）
			if (isNative) {
				cc.systemEvent.setAccelerometerEnabled(true);
				cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, onDeviceMotion, null);
			}

			// 快捷键（Web / 模拟器方便测试）
			document.addEventListener('keydown', function(e) {
				if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
					e.preventDefault();
					// window.saveGameLogs('[Reshuffle]');
					window.saveGameLogs('');
				}
			});

			// 启动提示
			let platformStr = 'Web';
			if (isIOS) platformStr = 'iOS';
			else if (isAndroid) platformStr = 'Android';

			original.log.call(console, `[LogCapture] 已启用 | 平台: ${platformStr} | 摇一摇可上报日志`);
		})();
	}
});