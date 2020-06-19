## 默认的`splitChunks`
### 说明
```js
    optimization: {
        splitChunks: {
            chunks: 'async',
            ...
            cacheGroups: {
                vender: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                }
            }
        }
    }
```
- `async`表示只有当动态引入的(`import()`)文件才会单独拆分
- `initial`表示只有在入口文件中引入的文件才会单独拆分
- `all`表示无论是在入口文件中引入的还是动态引入的都会单独拆分
- 具体拆分的条件根据`cacheGroups`进行
### 结果

执行`npm run default`,得到下文中的打包结果

```js
main.4618bfd7.js (110.66 KB) // 包含react-dom
page1.e6542837.chunk.js (85.62 KB) // 包含jquery
vendors~page1.7113917f.chunk.js (69.22 KB) // 包含loadsh
```
### 解析

- `main.js`是表示入口文件的打包文件，包含`react-dom`是因为入口文件引入了`react-dom`，没有单独拆分，是因为`chunks: 'async'`,而`react-dom`不是动态加载的，所以不会被单独拆分
- `page1.js`被拆分是因为这个文件是通过`import()`动态引入的，所以会被拆分
- `vendors~page1.js`被拆分出来是因为应用它的`page1`是动态引入的，满足`chunks: 'async'`条件，这个文件中只有`loadash`文件，而没有`jquery`是因为`vendors`中的`test`只检查了`node_modules`里面的文件，而`jquery`不是通过`node_modules`引入的

## 对`chunks`理解加深
### 说明
上面已经对`chunks`的取值做了说明，这里不在赘述
### 结果
执行 `npm run chunks`,得到下文中的打包结果
```js
vendors~main.492d890f.chunk.js (108.4 KB) // 包含react-dom
page1.e6542837.chunk.js (85.62 KB) // 包含jquery
vendors~page1.2e6615fc.chunk.js (69.22 KB) // 包含lodash
main.56b3d702.js (2.53 KB)
```
### 解析

- `main.js`是表示入口文件的打包文件，包含`react-dom`是因为入口文件引入了`react-dom`，没有单独拆分，是因为这次使用的配置文件是`webpack.config.chunks.js`,这个配置文件中`chunks: 'all'`,所以`react-dom`被单独拆分
- `page1.js`被拆分是因为这个文件是通过`import()`动态引入的，所以会被拆分
- `vendors~page1.js`被拆分出来是因为应用它的`page1`是动态引入的，满足`chunks: 'all'`条件，这个文件中只有`loadash`文件，而没有`jquery`是因为`vendors`中的`test`只检查了`node_modules`里面的文件，而`jquery`不是通过`node_modules`引入的

### 改变
将`webpack.config.chunks.js`配置文件中改为`chunks: 'initial'`  
则打包结果为
```js
page1.548c6b57.chunk.js (154.77 KB) // 包含jquery，lodash
vendors~main.492d890f.chunk.js (108.4 KB) // 包含react-dom
main.94254f19.js (2.47 KB)
```
### 解析2

- 配置文件为`chunks: 'initial'`,表示会将入口中符合条件的文件单独打包，而条件就是`vendors`中的`test`只检查了`node_modules`里面的文件所以`react-dom`被单独拆分到`vendor~main`中
- `page1.js`被拆分是因为这个文件是通过`import()`动态引入的，所以会被拆分
## 结合`chunks`对`cacheGroup`中的`default`理解加深
### 当`chunks`为`async`时
```js
    optimization: {
        splitChunks: {
            chunks: 'async',
            ...
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 1,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    }
```
- 这次使用的配置文件是`webpack.congig.entry2-async`，存在两个入口，`entry1`和`entry2`
#### 结果
执行 `npm run chunks-async`,得到下文中的打包结果
```js
entry2.ca47e5c9.js (195.17 KB) // 包含react-dom
entry1.cecda6d1.js (110.66 KB) // 包含react-dom
page1.c94353a3.chunk.js (85.62 KB) // 包含jquery
vendors~page1.510c9ce9.chunk.js (69.21 KB) // 包含lodash
```
### 解析
- 配置文件为`chunks: 'async'`,表示会将会将动态引入的文件单独拆分，而条件就是`vendors`中的`test`只检查了`node_modules`里面的文件所以`lodash`被单独拆分到`vendors~page1`中
- `page1.js`被拆分是因为这个文件是通过`import()`动态引入的，所以会被拆分
- `entry1`和`entry2`被拆分是因为是入口文件
- **这里对于为什么没有从`page1`中拆分出来`jquery`存有疑问，不太理解**

### 当`chunks`为`initial`时
```js
    optimization: {
        splitChunks: {
            chunks: 'initial',
            ...
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 1,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    }
```
### 结果
执行 `npm run chunks-initial`,得到下文中的打包结果
```js
page1.e31b8706.chunk.js (154.77 KB) // 包含jquery，lodash
vendors~entry1~entry2.eb9e87bd.chunk.js (108.4 KB) // 包含react-dom
default~entry2.76861983.chunk.js (86.01 KB) // 包含jquery
entry1.46c6e484.js (2.47 KB)
entry2.82c21f25.js (1.43 KB)
```
### 解析
- 配置文件为`chunks: 'initial'`,表示会将入口中符合条件的文件单独打包，而条件就是`vendors`中的`test`只检查了`node_modules`里面的文件所以`react-dom`被单独拆分到`vendors~entry1~entry2`中
- `default~entry2`存在是因为`default`的`minChunks:1`，表示一个chunk中存在就会被拆分，所以`jquery`被从`entry2中`拆分出来了
- `page1.js`被拆分是因为这个文件是通过`import()`动态引入的，所以会被拆分
- `entry1`和`entry2`被拆分是因为是入口文件

### 当`chunks`为`all`时
```js
    optimization: {
        splitChunks: {
            chunks: 'all',
            ...
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 1,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    }
```
### 结果
执行 `npm run chunks-all`,得到下文中的打包结果
```js
vendors~entry1~entry2.91c63d6b.chunk.js (108.4 KB) // 包含react-dom
default~entry2~page1.57aaf6cf.chunk.js (85.45 KB) // 包含jquery
vendors~page1.a7482c0f.chunk.js (69.21 KB) // 包含lodash
entry1.7e670f4e.js (2.57 KB)
entry2.d54d8a97.js (1.99 KB)
page1.2d1b6667.chunk.js (228 B)
```
### 解析
- 配置文件为`chunks: 'all'`,表示会将入口中符合条件的文件单独打包，而条件就是`vendors`中的`test`只检查了`node_modules`里面的文件所以`react-dom`被单独拆分到`vendors~entry1~entry2`中
- `default~entry2~page1`存在是因为`default`的`minChunks:1`，表示一个chunk中存在就会被拆分，并且此时`chunks: 'all'`,所以`jquery`被从`entry2中`和`page1`拆分出来了
- `page1.js`被拆分是因为这个文件是通过`import()`动态引入的，所以会被拆分
- `entry1`和`entry2`被拆分是因为是入口文件




#### reference

https://medium.com/dailyjs/webpack-4-splitchunks-plugin-d9fbbe091fd0
https://github.com/kwzm/webpack-splitChunks-demo