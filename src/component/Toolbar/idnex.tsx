import { Button, Card, Divider, Space, Tooltip } from 'antd';

import { IconLocation, IconLock, IconRoute, IconSquare } from '@tabler/icons-react';
import { useState } from 'react';
import classes from './style.module.css';
export default function Toolbar() {
  const [active, setActive] = useState('');

  const [lock, setLock] = useState(false);

  const actions = [
    {
      key: 'cursor',
      tooltip: 'Cursor',
      icon: <IconLocation style={{ transform: 'rotate(-90deg) translateX(-1px)' }} />,
    },
    {
      key: 'square',
      tooltip: 'Square',
      icon: <IconSquare />,
    },
    {
      key: 'connect',
      tooltip: 'Connect',
      icon: <IconRoute />,
    },
  ];

  return (
    <div className={classes.root}>
      <Card classNames={{ body: classes.body }}>
        <Space>
          <Tooltip title='Lock select'>
            <Button
              type={lock ? 'primary' : 'text'}
              size='large'
              icon={<IconLock />}
              onClick={() => setLock((prev) => !prev)}
            />
          </Tooltip>
          <Divider vertical />
          <Space size='middle'>
            {actions.map((item) => (
              <Tooltip key={item.key} title={item.tooltip}>
                <Button
                  size='large'
                  type={active === item.key ? 'primary' : 'text'}
                  icon={item.icon}
                  onClick={() => setActive(item.key)}
                />
              </Tooltip>
            ))}
          </Space>
        </Space>
      </Card>
    </div>
  );
}
