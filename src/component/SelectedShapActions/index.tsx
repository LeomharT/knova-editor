import { Card, Flex, Input, Space, Typography } from 'antd';
import classes from './style.module.css';

export default function SelectedShapActions() {
  return (
    <div className={classes.root}>
      <Card classNames={{ root: classes.card, body: classes.body }}>
        <Flex vertical gap={16}>
          <Space vertical>
            <Typography.Text strong>Name</Typography.Text>
            <Input />
          </Space>
          <Space vertical>Background</Space>
        </Flex>
      </Card>
    </div>
  );
}
