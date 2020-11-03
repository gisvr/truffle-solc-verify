# truffle-solc-verify
```bash
    yarn install
```


1. 使用truffle完成 合约的部署工作，目录下会产生一个build目录。

2. 将目录下面的build的contracts拷贝到 test目录下

3. 检查 的networks中对应的 address 是否和networks id 是否一致。

4. 检查contracts 的json文件中对应的sol文件路径下是否存在对应的sol文件。


在执行的环境中设置api的访问代理的环境变量
```bash
https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7891

export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7891
```

已调试方式执行：避免ethersacn部署合约的api访问限制   
test目录下的 [verify.test.js](test/verify.test.js) 文件

> 验证代理合约代码需要收到在networks 中增加address 例如
  ```js
  "networks": {
      "4": {
      "address": "0xf15475644b8e208c3a11379696ff903a85c44772"
     }
   },
```




