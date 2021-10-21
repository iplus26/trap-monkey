interface FnRecord {
  fnName: string;
  count: number;
  cost: number;
}

type Counter = Map<Function, FnRecord>;

export const trapMonkey = (options: { log?: 'debug' | 'once', reportDelay?: number }) => (constructor: any): any => {
  if (!isClass(constructor)) {
    throw new Error('`performance` decorator can only be used on ES6 class');
  }

  return class HijackedComponent extends constructor {
    #callCounter: Counter = new Map();

    constructor(...args: any[]) {
      super(...args);

      const hijacked = this as any;
      const counter = this.#callCounter;

      if (!options.log || options.log === 'once') {
        report(counter, options.reportDelay);
      }

      Object.getOwnPropertyNames(constructor.prototype)
        .forEach((fnName) => {
          const fn = hijacked[fnName];
          if (typeof fn === 'function' && fnName !== 'constructor') {
            // console.log(`hijacking ${fnName} of `);
            Object.defineProperty(hijacked, fnName, {
              get(): unknown {
                return function (...args: any[]) {
                  if (!counter.has(fn)) {
                    init(counter, fn, fnName);
                  }
                  const start = Date.now();
                  // @ts-ignore
                  const ret = fn.call(this, ...args);
                  const tmp = increase(counter, fn, start);
                  if (options.log === 'debug') {
                    console.log(`calling ${fnName} for ${tmp.count} times, cost ${tmp.cost}ms`);
                  }
                  return ret;
                };
              },
            });
          }
        });
    }
  };
};

function report(counter: Counter, delay?: number) {
  setTimeout(() => {
    const arr: FnRecord[] = [];
    counter.forEach((value) => {
      arr.push(value);
    });
    arr.sort((a, b) => {
      const cost = a.cost - b.cost;
      if (cost) {
        return cost;
      }
      return a.count - b.count;
    })
      .forEach(({ count, cost, fnName }) => {
        console.log(`${fnName} get called ${count.toLocaleString()} times, cost ${cost.toLocaleString()}ms`);
      });
  }, delay || 1e4);
}

function init(counter: Counter, fn: Function, fnName: string) {
  counter.set(fn, {
    count: 0,
    cost: 0,
    fnName,
  });
}

function increase(counter: Counter, fn: Function, start: number): FnRecord {
  const tmp = counter.get(fn)!;
  tmp.count += 1;
  tmp.cost += Date.now() - start;
  counter.set(fn, tmp);
  return tmp;
}

function isClass(func: unknown): boolean {
  return typeof func === 'function'
    && /^class\s/.test(Function.prototype.toString.call(func));
}
