const ft = window.fetch;

NProgress.configure({ easing: 'ease-in-out', speed: 500, minimum: 0.3 });

let progress = [];
function startProgress() {
  progress.push(progress.length);
  NProgress.start();
}

function doneProgress() {
  progress.shift();
  !progress.length && NProgress.done(true);
}

window.fetch = (url, options, silent) => {
  !silent &&  startProgress();
  let controller;
  let signal;
  if (AbortController) {
    controller = new AbortController();
    signal = controller.signal;
    options = options || {};
    options.signal = signal;
  }
  let cancelled = false;
  let p = new Promise((resolve, reject) => {
    setTimeout(() => {
      ft(url, options).then(res => {
        if (!cancelled) {
          !silent && doneProgress();
          resolve(res);
        }
      }).catch(err => {
        if (!cancelled) {
          !silent && doneProgress();
          reject(err);
        }
      });
    });
  });
  // when it cancelled response and error will not resolve
  p.cancel = () => {
    if (!cancelled) {
      !silent && doneProgress();
    }
    cancelled = true;
    controller && controller.abort();
  };

  return p;
}

export default window.fetch;
