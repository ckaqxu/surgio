// tslint:disable:no-expression-statement
import test from 'ava';
import fs from 'fs-extra';
import { join } from 'path';
import {
  convertNewSurgeScriptRuleToQuantumultXRewriteRule,
  convertSurgeScriptRuleToQuantumultXRewriteRule,
  getEngine,
} from '../template';

const templateEngine = getEngine(process.cwd());
const assetDir = join(__dirname, '../../../test/asset/');

test('clash #1', t => {
  const body = `{{ str | patchYamlArray }}`;
  const str = `IP-CIDR,67.198.55.0/24,Proxy,no-resolve`;
  const result = templateEngine.renderString(body, {
    str,
  });

  t.is(result, `- IP-CIDR,67.198.55.0/24,Proxy,no-resolve`);
});

test('clash #2', t => {
  const body = `{{ str | patchYamlArray }}`;
  const str = `IP-CIDR,67.198.55.0/24,Proxy,no-resolve // test rule`;
  const result = templateEngine.renderString(body, {
    str,
  });

  t.is(result, `- IP-CIDR,67.198.55.0/24,Proxy,no-resolve`);
});

test('clash #3', t => {
  const body = `{{ str | patchYamlArray }}`;
  const str = `PROCESS-NAME,Telegram,Proxy,no-resolve // test rule`;
  const result = templateEngine.renderString(body, {
    str,
  });

  t.is(result, '');
});

test('clash #4', t => {
  const body = `{{ str | patchYamlArray }}`;
  const str = `# Comment`;
  const result = templateEngine.renderString(body, {
    str,
  });

  t.is(result, '# Comment');
});

test('clash #5', t => {
  const body = `{{ str | patchYamlArray }}`;
  const str = `# Comment`;
  const result = templateEngine.renderString(body, {
    str,
  });

  t.is(result, '# Comment');
});

test('clash #6', t => {
  const body = `{{ str | patchYamlArray }}`;
  const str = `URL-REGEX,xxxxxxxxxxxx`;
  const result = templateEngine.renderString(body, {
    str,
  });

  t.is(result, '');
});

test('clash #7', t => {
  const body = `{{ str | clash }}`;

  t.is(templateEngine.renderString(body, { str: '# test' }), '# test');
  t.is(templateEngine.renderString(body, { str: '  ' }), '  ');
});

test('base64', t => {
  const body = `{{ str | base64 }}`;
  const str = `testtesttesttest`;

  const result = templateEngine.renderString(body, {
    str,
  });

  t.is(result, 'dGVzdHRlc3R0ZXN0dGVzdA==');
});

test('quantumultx filter 1', t => {
  const body = `{{ str | quantumultx }}`;

  t.is(
    templateEngine.renderString(body, {
      str: `PROCESS-NAME,Telegram,Proxy,no-resolve // test rule`,
    }),
    ''
  );
  t.is(
    templateEngine.renderString(body, {
      str: 'IP-CIDR6, 2001:4860:4860::8888/32, DIRECT',
    }),
    'IP6-CIDR, 2001:4860:4860::8888/32, DIRECT'
  );
});

test('quantumultx filter 2', t => {
  const body = `{{ str | quantumultx }}`;
  const str = fs.readFileSync(join(assetDir, 'surge-script-list.txt'), { encoding: 'utf8' });
  const result = templateEngine.renderString(body, {
    str,
  });

  t.snapshot(result);
});

test('mellow filter 1', t => {
  const body = `{{ str | mellow }}`;
  const str = `IP-CIDR,67.198.55.0/24,Proxy,no-resolve // test rule`;
  const result = templateEngine.renderString(body, {
    str,
  });

  t.is(result, 'IP-CIDR,67.198.55.0/24,Proxy');
});

test('mellow filter 2', t => {
  const body = `{{ str | mellow }}`;
  const str = `URL-REGEX,xxxxxxxxxxxx`;
  const result = templateEngine.renderString(body, {
    str,
  });

  t.is(result, '');
});

test('mellow filter 3', t => {
  const body = `{{ str | mellow }}`;
  const str = `# Comment`;
  const result = templateEngine.renderString(body, {
    str,
  });

  t.is(result, '# Comment');
});

test('spaces in string', t => {
  const str = `    `;

  t.is(templateEngine.renderString(`{{ str | mellow }}`, { str }), '    ');
  t.is(templateEngine.renderString(`{{ str | quantumultx }}`, { str }), '    ');
  t.is(templateEngine.renderString(`{{ str | patchYamlArray }}`, { str }), '    ');
});

test('ForeignMedia', t => {
  const str = fs.readFileSync(join(assetDir, 'ForeignMedia.list'), { encoding: 'utf8' });

  t.snapshot(templateEngine.renderString(`{{ str | quantumultx }}`, {
    str,
  }));
  t.snapshot(templateEngine.renderString(`{{ str | clash }}`, {
    str,
  }));
  t.snapshot(templateEngine.renderString(`{{ str | mellow }}`, {
    str,
  }));
});

test('stringify', t => {
  const obj = {
    foo: 'bar',
  };

  t.snapshot(templateEngine.renderString(`{{ obj | yaml }}`, {
    obj,
  }));
  t.snapshot(templateEngine.renderString(`{{ obj | json }}`, {
    obj,
  }));
});

test('convertSurgeScriptRuleToQuantumultXRewriteRule', t => {
  t.is(convertSurgeScriptRuleToQuantumultXRewriteRule(''), '');
  t.is(convertSurgeScriptRuleToQuantumultXRewriteRule('unknown-type https://api.zhihu.com/people/ script-path=https://raw.githubusercontent.com/onewayticket255/Surge-Script/master/surge%20zhihu%20people.js'), '');
});

test('convertNewSurgeScriptRuleToQuantumultXRewriteRule', t => {
  t.is(convertNewSurgeScriptRuleToQuantumultXRewriteRule(''), '');
  t.is(
    convertNewSurgeScriptRuleToQuantumultXRewriteRule('zhihu people = type=http-response,requires-body=1,max-size=0,pattern=https://api.zhihu.com/people/,script-path=https://raw.githubusercontent.com/onewayticket255/Surge-Script/master/surge%20zhihu%20people.js'),
    'https://api.zhihu.com/people/ url script-response-body https://raw.githubusercontent.com/onewayticket255/Surge-Script/master/surge%20zhihu%20people.js'
  );
  t.is(
    convertNewSurgeScriptRuleToQuantumultXRewriteRule('zhihu people = type=http-request,requires-body=1,max-size=0,pattern=https://api.zhihu.com/people/,script-path=https://raw.githubusercontent.com/onewayticket255/Surge-Script/master/surge%20zhihu%20people.js'),
    'https://api.zhihu.com/people/ url script-request-body https://raw.githubusercontent.com/onewayticket255/Surge-Script/master/surge%20zhihu%20people.js'
  );
  t.is(
    convertNewSurgeScriptRuleToQuantumultXRewriteRule('zhihu people = type=http-response,pattern=https://api.zhihu.com/people/,script-path=https://raw.githubusercontent.com/onewayticket255/Surge-Script/master/surge%20zhihu%20people.js'),
    'https://api.zhihu.com/people/ url script-response-header https://raw.githubusercontent.com/onewayticket255/Surge-Script/master/surge%20zhihu%20people.js'
  );
  t.is(
    convertNewSurgeScriptRuleToQuantumultXRewriteRule('zhihu people = type=http-request,pattern=https://api.zhihu.com/people/,script-path=https://raw.githubusercontent.com/onewayticket255/Surge-Script/master/surge%20zhihu%20people.js'),
    'https://api.zhihu.com/people/ url script-request-header https://raw.githubusercontent.com/onewayticket255/Surge-Script/master/surge%20zhihu%20people.js'
  );
  t.is(
    convertNewSurgeScriptRuleToQuantumultXRewriteRule('JD = requires-body=1,max-size=0,script-path= https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js,type=http-response,pattern=^https?://api\.m\.jd\.com/client\.action\?functionId=(start|signBean)'),
    '^https?://api\.m\.jd\.com/client\.action\?functionId=(start|signBean) url script-response-body https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js'
  );
  t.is(
    convertNewSurgeScriptRuleToQuantumultXRewriteRule('zhihu people = type=unknown-type'),
    ''
  );
});
