import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Space } from 'antd';
import { useBearStore } from '../../hooks/useBearStore';
import classes from './style.module.css';
export default function ZoomControl() {
  const { scale } = useBearStore();

  return (
    <Card className={classes.root} styles={{ body: { padding: 0 } }}>
      <Space.Compact>
        <Button size='large' type='text' icon={<MinusOutlined />}></Button>
        <Button size='large' type='text'>
          {(scale * 100).toFixed(0)} %
        </Button>
        <Button size='large' type='text' icon={<PlusOutlined />}></Button>
      </Space.Compact>
    </Card>
  );
}
