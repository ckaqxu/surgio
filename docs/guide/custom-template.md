---
title: Template 模板
sidebarDepth: 2
---

# Template 模板

Surgio 为了能够灵活地定义模板而引入了 [Nunjucks](https://nunjucks.bootcss.com/)。

需要注意的是文件名即为该 Template 的名称，后面在定义 Artifact 时会用到。

目录中默认已经包含针对 Surge，Quantumult 和 Clash 的模板和一些网友维护的规则片段 Snippet。

:::tip 提示
欢迎大家参与到默认规则的修订中！

[项目地址](https://github.com/geekdada/create-surgio-store/tree/master/template/template)
:::

## 模板变量

### providerName

当前 Provider 的名称。

### downloadUrl

当前文件对应的订阅地址。

### nodeList

过滤之后的节点列表。

### remoteSnippets

远程模板片段。假如你已经配置了一个像 [这样](/guide/custom-config.md#remotesnippets) 的远程片段，那就能够以下面的方式使用。

```
{{ remoteSnippets.cn.main('DIRECT') }}
```

生成的内容如下：

```
# China Apps
USER-AGENT,MicroMessenger Client,DIRECT
USER-AGENT,WeChat*,DIRECT
USER-AGENT,MApi*,DIRECT // Dianping
# Ali
DOMAIN-KEYWORD,alipay,DIRECT
DOMAIN-KEYWORD,taobao,DIRECT
DOMAIN-KEYWORD,alicdn,DIRECT
DOMAIN-KEYWORD,aliyun,DIRECT
DOMAIN-KEYWORD,.tmall.,DIRECT
# China
DOMAIN-SUFFIX,CN,DIRECT
DOMAIN-KEYWORD,baidu,DIRECT
```

如果你需要直接读取远程片段的内容，可以在模板里这样写：

```
{{ remoteSnippets.cn.text }}
```

### customParams

获取自定义的模板参数。请先在 Artifact 中定义再使用。

### clashProxyConfig

:::tip 提示
- 支持输出 Shadowsocks, Shadowsocksr, Vmess 节点
- Shadowsocksr 是通过 Clashr 项目支持的，你需要在 [这里](https://t.me/clashr4ssr) 下载可执行文件。项目地址在 [这里](https://github.com/sun8911879/shadowsocksR)。
:::

Clash 的 `Proxy` 和 `Proxy Group` 配置对象。`clashProxyConfig` 的内容依赖 Artifact 的 [`proxyGroupModifier` 函数](/guide/custom-artifact.md#proxygroupmodifier-nodelist-filters)。

由于很难在模板中直接书写 Yaml 格式的文本，所以引入了一个特殊的变量用来存储 Clash 的节点配置，然后利用 Nunjucks 的 [filter](https://nunjucks.bootcss.com/templating.html#part-cda1d805a3577fa5) 来输出 Yaml 格式文本。

```
{{ clashProxyConfig | yaml }}
```

:::tip 提示
你当然可以在模板中使用 Nunjucks 内置的 filter。
:::

### 如何在模板中使用变量？

相信聪明的你已经洞察一切。对，就是用 `{{ }}` 把变量包裹起来。

```html
<!-- .tpl 文件 -->
{{ downloadUrl }}
```

对于 `customParams`，则可以像这样：

```html
<!-- .tpl 文件 -->
{{ customParams.variable }}
```

## 过滤器

### 国家和地区过滤器

Surgio 内置多个节点名国别/地区过滤器。除非是火星文，Surgio 应该都能识别出来。它们是：

- hkFilter
- usFilter
- japanFilter
- singaporeFilter
- koreaFilter
- taiwanFilter

### netflixFilter

Netflix 节点过滤器。Surgio 默认会将名称中包含 *netflix*, *hkbn*, *hkt*, *hgc*（不分大小写）的节点过滤出来。如果在 Provider 中进行了覆盖则会运行新的方法。

[内置方法定义](https://github.com/geekdada/surgio/blob/master/lib/utils/filter.ts#L38)

### youtubePremiumFilter

Youtube Premium 节点过滤器。Surgio 默认会将名称中包含 *日*, *美*, *韩*, 🇯🇵, 🇺🇸, 🇰🇷 的节点过滤出来。如果在 Provider 中进行了覆盖则会运行新的方法。

- [内置方法定义](https://github.com/geekdada/surgio/blob/master/lib/utils/filter.ts#L81)
- [查看所有支持 Youtube Premium 的国家和地区](https://support.google.com/youtube/answer/6307365?hl=zh-Hans)

### customFilters

获取自定义 Filter。关于自定义 Filter 的用法，请阅读 [进阶 - 自定义 Filter](/guide/advance/custom-filter)。

### 如何使用过滤器？

我们以 `getSurgeNodes` 为例。默认情况下，使用 `getSurgeNodes(nodeList)` 输出的是所有节点。如果我们在第二个参数的位置传入过滤器，即可过滤想要的节点。

```html
<!-- .tpl 文件 -->
{{ getSurgeNodes(nodeList, netflixFilter) }}
```

这样即可输出支持 Netflix 的节点。

自定义过滤器的使用也非常类似。

```html
<!-- .tpl 文件 -->
{{ getSurgeNodes(nodeList, customFilters.this_is_a_filter) }}
```

## 模板方法

### getSurgeNodes

`getSurgeNodes(nodeList, filter?)`

:::tip 提示
- `filter` 为可选参数
- 支持输出 Shadowsocks, Shadowsocksr, HTTPS, Snell, Vmess 节点
- 请参考 [「Surge 进阶使用」](/guide/advance/surge-advance.md) 生成针对 Surge 的 SSR 订阅
:::

生成 Surge 规范的节点列表，例如：

```
🇺🇸US = custom, us.example.com, 10000, chacha20-ietf-poly1305, password, https://raw.githubusercontent.com/ConnersHua/SSEncrypt/master/SSEncrypt.module, udp-relay=true, obfs=tls, obfs-host=gateway-carry.icloud.com
🇭🇰HK(Netflix) = custom, hk.example.com, 10000, chacha20-ietf-poly1305, password, https://raw.githubusercontent.com/ConnersHua/SSEncrypt/master/SSEncrypt.module, udp-relay=true
```

### getShadowsocksNodes

`getShadowsocksNodes(nodeList, providerName)`

:::tip 提示
- 第二个入参为 Group 名称
:::

生成 Shadowsocks Scheme 列表，例如：

```
ss://cmM0LW1kNTpwYXNzd29yZA@us.com:1234/?group=subscribe_demo#%F0%9F%87%BA%F0%9F%87%B8%20US
ss://cmM0LW1kNTpwYXNzd29yZA@hk.com:1234/?group=subscribe_demo#%F0%9F%87%AD%F0%9F%87%B0%20HK
```

你可以使用 `base64` filter 来将上面的文本转换成 Quantumult 能够识别的订阅内容。

```html
<!-- .tpl 文件 -->
{{ getShadowsocksNodes(nodeList, providerName) | base64 }}
```

### getQuantumultNodes

`getQuantumultNodes(nodeList, providerName?, filter?)`

:::tip 提示
- 第二个参数为 Group 名称，可选
- 第三个参数可选，可传入标准的过滤器或自定义的过滤器
- 支持输出 Shadowsocks, Shadowsocksr, Vmess, HTTPS 节点
:::

生成 Quantumult 的节点配置，例如：

```
vmess://5rWL6K+VIDEgPSB2bWVzcywxLjEuMS4xLDgwODAsY2hhY2hhMjAtaWV0Zi1wb2x5MTMwNSwiMTM4NmY4NWUtNjU3Yi00ZDZlLTlkNTYtNzhiYWRiNzVlMWZkIiw2NCxncm91cD1TdXJnaW8sb3Zlci10bHM9ZmFsc2UsY2VydGlmaWNhdGU9MSxvYmZzPXdzLG9iZnMtcGF0aD0iLyIsb2Jmcy1oZWFkZXI9Ikhvc3Q6ZXhhbXBsZS5jb21bUnJdW05uXVVzZXItQWdlbnQ6TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxMl8zXzEgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBNb2JpbGUvMTVFMTQ4Ig==
vmess://5rWL6K+VIDIgPSB2bWVzcywxLjEuMS4xLDgwODAsY2hhY2hhMjAtaWV0Zi1wb2x5MTMwNSwiMTM4NmY4NWUtNjU3Yi00ZDZlLTlkNTYtNzhiYWRiNzVlMWZkIiw2NCxncm91cD1TdXJnaW8sb3Zlci10bHM9ZmFsc2UsY2VydGlmaWNhdGU9MSxvYmZzPXRjcCxvYmZzLXBhdGg9Ii8iLG9iZnMtaGVhZGVyPSJIb3N0OjEuMS4xLjFbUnJdW05uXVVzZXItQWdlbnQ6TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxMl8zXzEgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBNb2JpbGUvMTVFMTQ4Ig==
```

你可以使用 `base64` filter 来将上面的文本转换成 Quantumult 能够识别的订阅内容。

```html
<!-- .tpl 文件 -->
{{ getQuantumultNodes(nodeList, providerName) | base64 }}
```

### getQuantumultXNodes <Badge text="v1.3.0" vertical="middle" />

`getQuantumultXNodes(nodeList, filter?)`

:::tip 提示
- 第二个参数可选，可传入标准的过滤器或自定义的过滤器
- 支持输出 Shadowsocks, Shadowsocksr, Vmess, HTTPS 节点
- 支持添加 `udp-relay` 和 `fast-open` 配置
:::

生成 QuantumulX 的节点配置。该配置能用于 [`server_local`](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf#L88) 或者 [`server_remote`](https://github.com/crossutility/Quantumult-X/blob/master/server-complete.txt)。

### getNodeNames

`getNodeNames(nodeList, filter?)`

:::tip 提示
- `filter` 为可选参数
:::

生成一段逗号分隔的名称字符串，例如：

```
🇺🇸US, 🇭🇰HK(Netflix)
```

若需要过滤 Netflix 节点则传入：

```js
getNodeNames(nodeList, netflixFilter);
```

### getDownloadUrl

`getDownloadUrl(name)`

获得另一个文件的下载地址（链接前面部分取决于 `surgio.conf.js` 中 `urlBase` 的值），则可以这样写：

```js
getDownloadUrl('example.conf'); // https://example.com/example.conf
```

### 如何在模板中调用方法？

上面提到的这些模板方法都能够在模板文件中使用。原则就是用 `{{ }}` 把方法包裹起来。

```html
<!-- .tpl 文件 -->
{{ getQuantumultNodes(nodeList, providerName) | base64 }}

{{ getSurgeNodes(nodeList) }}
```

## 片段 (Snippet)

片段是一种特殊的模板，它依赖 Nunjucks 的 [宏（macro）](https://mozilla.github.io/nunjucks/cn/templating.html#macro) 来实现。什么是宏不重要，你只要依葫芦画瓢就可以写出自己的「片段」。

我们以 `snippet` 目录内的 `blocked_rules.tpl` 为例（内容有省略）：

```
{% macro main(rule) %}
DOMAIN-KEYWORD,bitly,{{ rule }}
DOMAIN-KEYWORD,blogspot,{{ rule }}
DOMAIN-KEYWORD,dropbox,{{ rule }}
DOMAIN-SUFFIX,twitpic.com,{{ rule }}
DOMAIN-SUFFIX,youtu.be,{{ rule }}
DOMAIN-SUFFIX,ytimg.com,{{ rule }}
{% endmacro %}
```

:::tip 提示
- 宏暴露了一个 `main` 方法，传入一个字符串变量
- 你可以使用 Nunjucks 宏的其它特性
:::

使用的时候只需要 `import` 这个模板：

```
{% import './snippet/blocked_rules.tpl' as blocked_rules %}

{{ blocked_rules.main('🚀 Proxy') }}
```

最终得到的规则是：

```
DOMAIN-KEYWORD,bitly,🚀 Proxy
DOMAIN-KEYWORD,blogspot,🚀 Proxy
DOMAIN-KEYWORD,dropbox,🚀 Proxy
DOMAIN-SUFFIX,twitpic.com,🚀 Proxy
DOMAIN-SUFFIX,youtu.be,🚀 Proxy
DOMAIN-SUFFIX,ytimg.com,🚀 Proxy
```

### Clash 规则格式处理

由于 Yaml 的数组类型必须在每一条数据前加 `-`，所以提供了一个处理函数将规则转换成 Clash 能够识别的数组。

```
{% import './snippet/blocked_rules.tpl' as blocked_rules %}

{{ blocked_rules.main('🚀 Proxy') | patchYamlArray }}
```

最终得到的规则是：

```
- DOMAIN-KEYWORD,bitly,🚀 Proxy
- DOMAIN-KEYWORD,blogspot,🚀 Proxy
- DOMAIN-KEYWORD,dropbox,🚀 Proxy
- DOMAIN-SUFFIX,twitpic.com,🚀 Proxy
- DOMAIN-SUFFIX,youtu.be,🚀 Proxy
- DOMAIN-SUFFIX,ytimg.com,🚀 Proxy
```

需要注意的是，`patchYamlArray` 除了更改格式，还会将 Clash 不支持的规则类型省略，例如：

- USER-AGENT
- PROCESS-NAME
- no-resolve（仅除去该字段，其它部分保留）

### QuantumultX 规则处理

由于 QuantumultX 目前暂时还不支持 `URL-REGEX` 和 `PROCESS-NAME`，所以需要把这些规则从配置中除去。

```
{% import './snippet/blocked_rules.tpl' as blocked_rules %}

{{ blocked_rules.main('🚀 Proxy') | quantumultx }}
```