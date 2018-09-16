import qs from 'qs';
import utils from '@/utils';
import { MockConfig } from '@/interface';

import baseData from '@/mock/baseData';

interface UserMap {
  id: number,
  username: string,
  password: string,
  permissions: Premission,
}
interface Premission {
  role: string,
  permission?: Array<string>
}
const EnumRoleType = {
  ADMIN: 'admin',
  DEFAULT: 'guest',
  DEVELOPER: 'developer',
};
const userPermission: Premission[] = [
  {
    permission: ['1', '2', '3', '4', '5'],
    role: EnumRoleType.ADMIN,
  },
  {
    permission: ['1', '2', '21', '7', '5', '51', '52', '53'],
    role: EnumRoleType.DEFAULT,
  },
  {
    role: EnumRoleType.DEVELOPER,
  },
];
const userMap: UserMap[] = [
  {
    id: 0,
    username: 'admin',
    password: 'admin',
    permissions: userPermission[0],
  }, {
    id: 1,
    username: 'guest',
    password: 'guest',
    permissions: userPermission[1],
  }, {
    id: 2,
    username: '吴彦祖',
    password: '123456',
    permissions: userPermission[2],
  },
];

export default {
  loginByUsername: (config: MockConfig, res: any) => {
    const { username, password, authCode } = qs.parse(config.body);
    const user = userMap.filter(item => item.username === username);

    if (user.length > 0 && user[0].password === password) {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      const data = baseData('success', '登录成功');
      res.cookie('token', JSON.stringify({ id: user[0].id, deadline: now.getTime() }), {
        maxAge: 900000,
        httpOnly: true,
      });
      return data;
    }
    return baseData('error', '用户名密码错误');
  },
  getUserInfo: (req: MockConfig, res: any) => {
    const cookie = req.headers.cookie || '';
    const cookies = qs.parse(cookie.replace(/\s/g, ''), { delimiter: ';' });
    const response: any = {};
    const user: any = {};
    if (!cookies.token) {
      return baseData('error', '登录超时', 3);
    }
    const token = JSON.parse(cookies.token);
    if (token) {
      response.success = token.deadline > new Date().getTime();
    }
    if (response.success) {
      const userItem = userMap.filter(_ => _.id === token.id);
      if (userItem.length > 0) {
        user.permissions = userItem[0].permissions;
        user.username = userItem[0].username;
        user.id = userItem[0].id;
      }
      const data = baseData('success', '获取成功');
      data.entity = user;
      return data;
    }
    return baseData('error', '登录超时', 3);
  },
  logout: () => 'success',
};