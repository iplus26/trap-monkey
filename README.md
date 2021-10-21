# trap-monkey
Measures performance of ES6 class via decorator

## Usage 

```typescript
import {trapMonkey} from "trap-monkey";

@trapMonkey({ mode: 'once', name: 'my-buggy' })
class MyBuggyComponent {
    slowMethod() { 
        const now = Date.now();
        while(Date.now() - now <= 2) { 
            // do nothing
        }
    }
}
```

## API 

|               | Type                 | Default Value | Description                                                  |
| ------------- | -------------------- | ------------- | ------------------------------------------------------------ |
| `mode`        | `'once' | 'debug'` | `'report'`    | If `log` is set to `'once'`, the performance will be print in 10s after component is initialized; in other hand, in `'debug'` mode, performance will be print at every time method is called. |
| `reportDelay` | number               | 1e4           | After `reportDelay` ms, performance will be print. Only works in `'once'` mode. |
| `name`        | string               | `''`          | Custom name of target class.                                 |

