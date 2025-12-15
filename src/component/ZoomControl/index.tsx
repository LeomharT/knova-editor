import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Space, Tooltip } from 'antd';
import { useBearStore } from '../../hooks/useBearStore';
import classes from './style.module.css';

type ZoomControlProps = {
  onReset?: () => void;
};

export default function ZoomControl(props: ZoomControlProps) {
  const { scale } = useBearStore();

  const value = (scale * 100).toFixed(0);

  return (
    <Card className={classes.root} styles={{ body: { padding: 0 } }}>
      <Space.Compact>
        <Button
          disabled={Number(value) <= 50}
          size='large'
          type='text'
          icon={<MinusOutlined />}
        ></Button>
        <Tooltip arrow={false} title='Reset zoom'>
          <Button size='large' type='text' onClick={props.onReset}>
            {value} %
          </Button>
        </Tooltip>
        <Button size='large' type='text' icon={<PlusOutlined />}></Button>
      </Space.Compact>
    </Card>
  );
}
