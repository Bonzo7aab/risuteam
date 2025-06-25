import { useState, useEffect } from "react";
import { Button, Input, Label } from "./index";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import {
  SortableList,
  SortableListItem,
  Item as SortableItem,
} from "./sortable-list";

interface DialogProgramProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SortableItem[];
  onChange: (items: SortableItem[]) => void;
  disabled?: boolean;
}

export function DialogProgram({
  open,
  onOpenChange,
  items,
  onChange,
  disabled,
}: DialogProgramProps) {
  const [localItems, setLocalItems] = useState<SortableItem[]>([]);
  const [newProgramText, setNewProgramText] = useState("");

  useEffect(() => {
    if (open) {
      setLocalItems([...items]);
      setNewProgramText("");
    }
  }, [open, items]);

  const handleAdd = () => {
    if (newProgramText.trim()) {
      const newItems = [
        ...localItems,
        {
          id: String(Date.now()),
          text: newProgramText.trim(),
          checked: false,
          description: "",
        },
      ];
      setLocalItems(newItems);
      setNewProgramText("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pt-12">
        <div className="mb-2 flex gap-2">
          <Input
            value={newProgramText}
            onChange={(e) => setNewProgramText(e.target.value)}
            placeholder="Dodaj punkt programu"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAdd();
                e.preventDefault();
              }
            }}
            disabled={disabled}
          />
          <Button type="button" onClick={handleAdd} disabled={disabled}>
            Dodaj
          </Button>
        </div>
        <Label className="text-gray-500">Program</Label>
        <SortableList
          items={localItems}
          setItems={(newItems) => {
            setLocalItems(newItems);
          }}
          onCompleteItem={(id) => {
            const newItems = localItems.filter((item) => item.id !== id);
            setLocalItems(newItems);
          }}
          renderItem={(item, order, onCompleteItem, onRemoveItem) => (
            <SortableListItem
              key={item.id}
              item={item}
              order={order}
              onCompleteItem={() => {
                const newItems = localItems.filter((i) => i.id !== item.id);
                setLocalItems(newItems);
              }}
              onRemoveItem={() => {
                const newItems = localItems.filter((i) => i.id !== item.id);
                setLocalItems(newItems);
              }}
              handleDrag={() => {}}
            />
          )}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="default"
            onClick={() => {
              onChange(localItems);
              onOpenChange(false);
            }}
            disabled={disabled}
          >
            Zatwierdź
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabled}
          >
            Anuluj
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
