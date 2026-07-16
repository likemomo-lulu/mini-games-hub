/**
 * 页面级定时器管理器。
 * 业务口径：所有游戏页的 timeout / interval 应通过它注册，页面卸载或重开一局时可按 key 或前缀统一清理，
 * 避免隐藏页继续刷新、重复开局产生多个循环、以及回调晚到污染新一局状态。
 */
function createTimerManager() {
  const timers = {};
  let autoId = 0;

  function clear(key) {
    const item = timers[key];
    if (!item) return;
    if (item.type === 'interval') {
      clearInterval(item.id);
    } else {
      clearTimeout(item.id);
    }
    delete timers[key];
  }

  function setManagedTimeout(key, callback, delay) {
    clear(key);
    const id = setTimeout(() => {
      delete timers[key];
      callback();
    }, delay);
    timers[key] = { id, type: 'timeout' };
    return key;
  }

  function setManagedInterval(key, callback, delay) {
    clear(key);
    const id = setInterval(callback, delay);
    timers[key] = { id, type: 'interval' };
    return key;
  }

  function addTimeout(prefix, callback, delay) {
    const key = `${prefix}:${++autoId}`;
    return setManagedTimeout(key, callback, delay);
  }

  function clearByPrefix(prefix) {
    Object.keys(timers)
      .filter(key => key.indexOf(prefix) === 0)
      .forEach(clear);
  }

  function clearAll() {
    Object.keys(timers).forEach(clear);
  }

  function has(key) {
    return Boolean(timers[key]);
  }

  return {
    setTimeout: setManagedTimeout,
    setInterval: setManagedInterval,
    addTimeout,
    clear,
    clearByPrefix,
    clearAll,
    has,
  };
}

module.exports = {
  createTimerManager,
};
