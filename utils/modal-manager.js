function canUseWx(method) {
  return typeof wx !== 'undefined' && typeof wx[method] === 'function';
}

/**
 * 统一轻提示样式和错误兜底。
 * @param {Object|string} options - 字符串会作为 title；对象透传微信 toast 配置。
 */
function showToast(options) {
  if (!canUseWx('showToast')) return;
  const config = typeof options === 'string' ? { title: options } : options || {};
  wx.showToast({
    icon: 'none',
    duration: 1600,
    ...config,
  });
}

/**
 * 统一确认弹窗。
 * @param {Object} options - 微信 showModal 配置，支持 onConfirm/onCancel 回调。
 */
function showConfirm(options = {}) {
  if (!canUseWx('showModal')) return;
  const { onConfirm, onCancel, ...modalOptions } = options;
  wx.showModal({
    confirmColor: '#FF6B6B',
    cancelColor: '#636E72',
    ...modalOptions,
    success: (res) => {
      if (res.confirm) {
        if (typeof onConfirm === 'function') onConfirm(res);
        return;
      }
      if (typeof onCancel === 'function') onCancel(res);
    },
    fail: (error) => {
      console.error('弹窗展示失败:', modalOptions.title || '', error);
    },
  });
}

module.exports = {
  showToast,
  showConfirm,
};
