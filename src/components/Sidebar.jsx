/* eslint-disable react/prop-types */
import {
  Button,
  ButtonGroup,
  Listbox,
  ListboxItem,
  Spacer,
} from "@nextui-org/react";

const Sidebar = ({ factories, onSelectFactory }) => {
  return (
    <div className="p-4 border-spacing-2 border-r-2 border-gray-300">
      <ButtonGroup
        size="sm"
        fullWidth="true"
        color="success"
        variant="flat"
        radius="sm"
      >
        <Button>添加</Button>
        <Button>A</Button>
        <Button>设置</Button>
      </ButtonGroup>

      <Spacer y={4} />

      <Listbox aria-label="Actions" onAction={(key) => onSelectFactory(key)}>
        {factories.map((item) => (
          <ListboxItem key={item}>{item}</ListboxItem>
        ))}
      </Listbox>
    </div>
  );
};

export default Sidebar;
