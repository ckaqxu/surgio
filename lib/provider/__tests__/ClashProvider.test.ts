import test from 'ava';
import nock from 'nock';
import { RELAY_SERVICE } from '../../utils/constant';

import ClashProvider, { getClashSubscription, parseClashConfig } from '../ClashProvider';
import { NodeTypeEnum, SupportProviderEnum } from '../../types';

test('ClashProvider', async t => {
  const provider = new ClashProvider('test', {
    type: SupportProviderEnum.Clash,
    url: 'http://example.com/clash-sample.yaml',
  });

  await t.notThrowsAsync(async () => {
    await provider.getNodeList();
  });
});

test('ClashProvider new format', async t => {
  const scope = nock('http://local')
    .get('/success-1')
    .reply(200, `
proxies: []
    `);

  const provider = new ClashProvider('test', {
    type: SupportProviderEnum.Clash,
    url: 'http://local/success-1',
  });

  t.deepEqual(await provider.getNodeList(), []);
});

test('ClashProvider.getSubscriptionUserInfo', async t => {
  let provider = new ClashProvider('test', {
    type: SupportProviderEnum.Clash,
    url: 'http://example.com/clash-sample-with-user-info.yaml',
  });
  let userInfo = await provider.getSubscriptionUserInfo();
  t.deepEqual(userInfo, {
    upload: 891332010,
    download: 29921186546,
    total: 322122547200,
    expire: 1586330887,
  });

  provider = new ClashProvider('test', {
    type: SupportProviderEnum.Clash,
    url: 'http://example.com/clash-sample.yaml',
  });
  userInfo = await provider.getSubscriptionUserInfo();
  t.is(userInfo, void 0);
});

test('getClashSubscription', async t => {
  const { nodeList } = await getClashSubscription('http://example.com/clash-sample.yaml');
  const config = [...nodeList];

  t.deepEqual(config.map(item => item.nodeName), ['ss1', 'ss2', 'ss3', 'vmess', 'vmess custom header', 'http 1', 'http 2','snell', 'ss4', 'ss-wss']);
  t.deepEqual(config.shift(), {
    type: NodeTypeEnum.Shadowsocks,
    nodeName: 'ss1',
    hostname: 'server',
    port: 443,
    method: 'chacha20-ietf-poly1305',
    password: 'password',
    'udp-relay': true,
  });
  t.deepEqual(config.shift(), {
    type: NodeTypeEnum.Shadowsocks,
    nodeName: 'ss2',
    hostname: 'server',
    port: 443,
    method: 'chacha20-ietf-poly1305',
    password: 'password',
    'udp-relay': false,
    obfs: 'tls',
    'obfs-host': 'www.bing.com'
  });
  t.deepEqual(config.shift(), {
    type: NodeTypeEnum.Shadowsocks,
    nodeName: 'ss3',
    hostname: 'server',
    port: 443,
    method: 'chacha20-ietf-poly1305',
    password: 'password',
    'udp-relay': false,
    obfs: 'ws',
    'obfs-host': 'server',
    'obfs-uri': '/',
    wsHeaders: {},
  });
  t.deepEqual(config.shift(), {
    type: NodeTypeEnum.Vmess,
    nodeName: 'vmess',
    hostname: 'server',
    port: 443,
    uuid: 'uuid',
    alterId: '32',
    method: 'auto',
    tls: false,
    network: 'tcp',
    udp: false,
  });
  t.deepEqual(config.shift(), {
    type: NodeTypeEnum.Vmess,
    nodeName: 'vmess custom header',
    hostname: 'server',
    host: 'server',
    path: '/path',
    port: 443,
    uuid: 'uuid',
    alterId: '32',
    method: 'auto',
    network: 'ws',
    udp: false,
    tls: true,
    tls13: false,
    skipCertVerify: false,
    wsHeaders: {
      edge: 'www.baidu.com',
    },
  });
  t.deepEqual(config.shift(), {
    type: NodeTypeEnum.HTTPS,
    nodeName: 'http 1',
    hostname: 'server',
    port: 443,
    username: 'username',
    password: 'password',
    skipCertVerify: false,
    tls13: false,
  });
  t.deepEqual(config.shift(), {
    type: NodeTypeEnum.HTTP,
    nodeName: 'http 2',
    hostname: 'server',
    port: 443,
    username: 'username',
    password: 'password',
  });
  t.deepEqual(config.shift(), {
    type: NodeTypeEnum.Snell,
    nodeName: 'snell',
    hostname: 'server',
    port: 44046,
    psk: 'yourpsk',
    obfs: 'http',
  });
  t.deepEqual(config.shift(), {
    type: NodeTypeEnum.Shadowsocks,
    nodeName: 'ss4',
    hostname: 'server',
    port: 443,
    method: 'chacha20-ietf-poly1305',
    password: 'password',
    'udp-relay': false,
    obfs: 'tls',
    'obfs-host': 'example.com'
  });
  t.deepEqual(config.shift(), {
    type: NodeTypeEnum.Shadowsocks,
    nodeName: 'ss-wss',
    hostname: 'server',
    port: 443,
    method: 'chacha20-ietf-poly1305',
    password: 'password',
    'udp-relay': false,
    obfs: 'wss',
    'obfs-host': 'cloudflare.com',
    'obfs-uri': '/ws',
    skipCertVerify: false,
    tls13: false,
    wsHeaders: {},
  });
});

test('getClashSubscription udpRelay', async t => {
  const { nodeList: config } = await getClashSubscription('http://example.com/clash-sample.yaml', true);

  t.deepEqual(config[0], {
    type: NodeTypeEnum.Shadowsocks,
    nodeName: 'ss1',
    hostname: 'server',
    port: 443,
    method: 'chacha20-ietf-poly1305',
    password: 'password',
    'udp-relay': true,
  });
  t.deepEqual(config[1], {
    type: NodeTypeEnum.Shadowsocks,
    nodeName: 'ss2',
    hostname: 'server',
    port: 443,
    method: 'chacha20-ietf-poly1305',
    password: 'password',
    'udp-relay': true,
    obfs: 'tls',
    'obfs-host': 'www.bing.com',
  });
  t.deepEqual(config[2], {
    type: NodeTypeEnum.Shadowsocks,
    nodeName: 'ss3',
    hostname: 'server',
    port: 443,
    method: 'chacha20-ietf-poly1305',
    password: 'password',
    'udp-relay': true,
    obfs: 'ws',
    'obfs-host': 'server',
    'obfs-uri': '/',
    wsHeaders: {},
  });
  t.deepEqual(config[3], {
    type: NodeTypeEnum.Vmess,
    nodeName: 'vmess',
    hostname: 'server',
    port: 443,
    uuid: 'uuid',
    alterId: '32',
    method: 'auto',
    tls: false,
    network: 'tcp',
    udp: true,
  });
});

test('getClashSubscription - invalid yaml', async t => {
  const scope = nock('http://local')
    .get('/fail-1')
    .reply(200, '')
    .get('/fail-2')
    .reply(200, `
foo: bar
    `);

  await t.throwsAsync(async () => {
    await getClashSubscription('http://example.com/test-v2rayn-sub.txt');
  }, {instanceOf: Error, message: 'http://example.com/test-v2rayn-sub.txt 订阅内容有误，请检查后重试'});

  await t.throwsAsync(async () => {
    await getClashSubscription('http://local/fail-1');
  }, {instanceOf: Error, message: 'http://local/fail-1 订阅内容有误，请检查后重试'});

  await t.throwsAsync(async () => {
    await getClashSubscription('http://local/fail-2');
  }, {instanceOf: Error, message: 'http://local/fail-2 订阅内容有误，请检查后重试'});
});

test('snell Configurations', t => {
  t.deepEqual(
    parseClashConfig([{
      type: 'snell',
      name: 'snell',
      server: 'server',
      port: 44046,
      psk: 'yourpsk',
      'obfs-opts': {
        mode: 'tls',
        host: 'example.com'
      },
      version: '2',
    }]),
    [{
      type: NodeTypeEnum.Snell,
      nodeName: 'snell',
      hostname: 'server',
      port: 44046,
      psk: 'yourpsk',
      obfs: 'tls',
      'obfs-host': 'example.com',
      version: '2',
    }]
  );
});

test('trojan configurations', t => {
  t.deepEqual(
    parseClashConfig([{
      type: 'trojan',
      name: 'trojan',
      server: 'example.com',
      port: 443,
      password: 'password1',
    }]),
    [{
      type: NodeTypeEnum.Trojan,
      nodeName: 'trojan',
      hostname: 'example.com',
      port: 443,
      password: 'password1',
      tls13: false,
      'udp-relay': false,
    }]
  );
  t.deepEqual(
    parseClashConfig([{
      type: 'trojan',
      name: 'trojan',
      server: 'example.com',
      port: 443,
      password: 'password1',
      'skip-cert-verify': true,
      alpn: ['http/1.1'],
      sni: 'sni.example.com',
      udp: true,
    }]),
    [{
      type: NodeTypeEnum.Trojan,
      nodeName: 'trojan',
      hostname: 'example.com',
      port: 443,
      password: 'password1',
      skipCertVerify: true,
      alpn: ['http/1.1'],
      sni: 'sni.example.com',
      'udp-relay': true,
      tls13: false,
    }]
  );
  t.deepEqual(
    parseClashConfig([{
      type: 'trojan',
      name: 'trojan',
      server: 'example.com',
      port: 443,
      password: 'password1',
      'skip-cert-verify': true,
      alpn: ['http/1.1'],
      sni: 'sni.example.com',
      udp: false,
    }], true, true),
    [{
      type: NodeTypeEnum.Trojan,
      nodeName: 'trojan',
      hostname: 'example.com',
      port: 443,
      password: 'password1',
      skipCertVerify: true,
      alpn: ['http/1.1'],
      sni: 'sni.example.com',
      'udp-relay': true,
      tls13: true,
    }]
  );
});

test('shadowsocks v2ray mux', async t => {
  t.deepEqual(
    parseClashConfig([{
      name: 'ss-v2ray-mux',
      type: 'ss',
      server: 'server',
      port: 443,
      cipher: 'chacha20-ietf-poly1305',
      password: 'password',
      plugin: 'v2ray-plugin',
      'plugin-opts': {
        mode: 'websocket',
        mux: true,
        tls: true,
        headers: {
          custom: 'value'
        },
        'skip-cert-verify': true,
      }
    }]),
    [{
      type: NodeTypeEnum.Shadowsocks,
      nodeName: 'ss-v2ray-mux',
      hostname: 'server',
      port: 443,
      method: 'chacha20-ietf-poly1305',
      password: 'password',
      obfs: 'wss',
      'obfs-host': 'server',
      'obfs-uri': '/',
      mux: true,
      'udp-relay': false,
      skipCertVerify: true,
      tls13: false,
      wsHeaders: {
        custom: 'value',
      },
    }]
  );
});

test('ClashProvider relayUrl', async t => {
  const provider = new ClashProvider('test', {
    type: SupportProviderEnum.Clash,
    url: 'http://example.com/clash-sample.yaml',
    relayUrl: true,
  });

  t.is(provider.url, `${RELAY_SERVICE}http://example.com/clash-sample.yaml`);
});
