import { Button, Card, Divider, Space, Tooltip } from 'antd';

import { IconLocation, IconLock, IconSquare } from '@tabler/icons-react';
import { useState } from 'react';
import classes from './style.module.css';
export default function Toolbar() {
  const [active, setActive] = useState('');

  return (
    <div className={classes.root}>
      <Card classNames={{ body: classes.body }}>
        <Space>
          <Tooltip title='Lock select'>
            <Button
              type={active === 'lock' ? 'primary' : 'text'}
              size='large'
              icon={<IconLock />}
              onClick={() => setActive('lock')}
            />
          </Tooltip>
          <Divider vertical />
          <Space size='middle'>
            <Tooltip title='Cursor'>
              <Button
                type={active === 'cursor' ? 'primary' : 'text'}
                size='large'
                icon={<IconLocation style={{ transform: 'rotate(-90deg) translateX(-1px)' }} />}
                onClick={() => setActive('cursor')}
              />
            </Tooltip>
            <Tooltip title='Square'>
              <Button
                type={active === 'rect' ? 'primary' : 'text'}
                size='large'
                icon={<IconSquare />}
                onClick={() => setActive('rect')}
              />
            </Tooltip>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
