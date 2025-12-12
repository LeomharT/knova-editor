import { Button, Card, Divider, Space } from 'antd';

import { IconSquare } from '@tabler/icons-react';
import { useState } from 'react';
import classes from './style.module.css';
export default function Toolbar() {
  const [active, setActive] = useState('');

  return (
    <div className={classes.root}>
      <Card>
        <Space>
          <Button
            type={active === 'rect' ? 'primary' : 'default'}
            size='large'
            icon={<IconSquare />}
            onClick={() => setActive('rect')}
          />
          <Divider vertical />
        </Space>
      </Card>
    </div>
  );
}
