import { IconLocation, IconLock, IconRoute, IconSquare } from '@tabler/icons-react';
import { Button, Card, Divider, Space, Tooltip } from 'antd';
import { useBearStore } from '../../hooks/useBearStore';
import classes from './style.module.css';

export default function Toolbar() {
  const { action, setAction } = useBearStore();

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
              type={action.locked ? 'primary' : 'text'}
              size='large'
              icon={<IconLock />}
              onClick={() => setAction({ ...action, locked: !action.locked })}
            />
          </Tooltip>
          <Divider vertical />
          <Space size='middle'>
            {actions.map((item) => (
              <Tooltip key={item.key} title={item.tooltip}>
                <Button
                  size='large'
                  type={action.active === item.key ? 'primary' : 'text'}
                  icon={item.icon}
                  onClick={() => setAction({ ...action, active: item.key })}
                />
              </Tooltip>
            ))}
          </Space>
        </Space>
      </Card>
    </div>
  );
}
