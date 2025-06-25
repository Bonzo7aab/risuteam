"use client";

// npx shadcn-ui@latest add checkbox
// npm  i react-use-measure
import { Dispatch, ReactNode, SetStateAction, useState, useRef } from "react";
import { Trash, Trash2 } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  Reorder,
  motion,
  useDragControls,
} from "motion/react";
import useMeasure from "react-use-measure";

import { cn } from "@/utils";
import { Checkbox } from "@/components/ui/checkbox";

export type Item = {
  text: string;
  checked: boolean;
  id: string;
  description: string;
  // Allow extra fields for custom use cases
  [key: string]: any;
};

interface SortableListItemProps<T extends Item = Item> {
  item: T;
  order: number;
  onCompleteItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  renderExtra?: (item: T) => React.ReactNode;
  isExpanded?: boolean;
  className?: string;
  handleDrag: () => void;
  handleDragStart?: () => void;
  handleDragEnd?: () => void;
  disabled?: boolean;
}

function SortableListItem<T extends Item = Item>({
  item,
  order,
  onCompleteItem,
  onRemoveItem,
  renderExtra,
  handleDrag,
  isExpanded,
  className,
  handleDragStart,
  handleDragEnd,
  disabled = false,
}: SortableListItemProps<T>) {
  let [ref, bounds] = useMeasure();
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(true);
  const dragControls = useDragControls();

  const onDragStart = (event: any) => {
    setIsDragging(true);
    dragControls.start(event, { snapToCursor: true });
    handleDrag();
    if (handleDragStart) handleDragStart();
  };

  const onDragEnd = () => {
    setIsDragging(false);
    if (handleDragEnd) handleDragEnd();
  };

  return (
    <motion.div
      className={cn(disabled ? "opacity-60 grayscale" : "", className)}
      key={item.id}
    >
      <div className="flex w-full items-center">
        <Reorder.Item
          value={item}
          className={cn(
            "relative z-auto grow",
            "h-full rounded-xl bg-[#161716]/80",
            "shadow-[0px_1px_0px_0px_hsla(0,0%,100%,.03)_inset,0px_0px_0px_1px_hsla(0,0%,100%,.03)_inset,0px_0px_0px_1px_rgba(0,0,0,.1),0px_2px_2px_0px_rgba(0,0,0,.1),0px_4px_4px_0px_rgba(0,0,0,.1),0px_8px_8px_0px_rgba(0,0,0,.1)]",
            item.checked ? "cursor-not-allowed" : "cursor-grab",
            item.checked && !isDragging ? "w-7/10" : "w-full"
          )}
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            height: bounds.height > 0 ? bounds.height : undefined,
            transition: {
              type: "spring",
              bounce: 0,
              duration: 0.4,
            },
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.05,
              type: "spring",
              bounce: 0.1,
            },
          }}
          layout
          layoutId={`item-${item.id}`}
          dragListener={!item.checked && !disabled}
          dragControls={dragControls}
          onDragEnd={onDragEnd}
          style={
            isExpanded
              ? {
                  zIndex: 9999,
                  marginTop: 10,
                  marginBottom: 10,
                  position: "relative",
                  overflow: "hidden",
                }
              : {
                  position: "relative",
                  overflow: "hidden",
                }
          }
          whileDrag={{ zIndex: 9999 }}
        >
          <div ref={ref} className={cn(isExpanded ? "" : "", "z-20 ")}>
            <motion.div layout="position" className="flex items-center w-full">
              {/* Main content left-aligned */}
              <div className="flex items-center flex-1 min-w-0 gap-2">
                {/* List Order */}
                <p className="font-mono text-xs ml-2 text-white/50">
                  {order + 1}
                </p>
                {/* List Title */}
                <motion.div
                  className="p-1 min-w-[150px]"
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ bounce: 0.2, type: "spring" }}
                >
                  <h4 className="tracking-tight text-base md:text-lg text-white/70">
                    {item.text}
                  </h4>
                </motion.div>
                {/* List Item Children (e.g. image) */}
                {renderExtra && renderExtra(item)}
              </div>
              {/* Delete button right-aligned */}
              <button
                type="button"
                title="Usuń"
                aria-label="Usuń"
                onClick={() => onRemoveItem(item.id)}
                className="mr-2 p-1 rounded-full text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                disabled={disabled}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
          <div
            onPointerDown={isDraggable ? onDragStart : undefined}
            style={{ touchAction: "none" }}
          />
        </Reorder.Item>
      </div>
    </motion.div>
  );
}

SortableListItem.displayName = "SortableListItem";

interface SortableListProps<T extends Item = Item> {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  onCompleteItem: (id: string) => void;
  renderItem: (
    item: T,
    order: number,
    onCompleteItem: (id: string) => void,
    onRemoveItem: (id: string) => void,
    handleDragStart?: () => void,
    handleDragEnd?: () => void
  ) => ReactNode;
  onReorder?: (items: T[]) => void;
  onReorderComplete?: (items: T[]) => void;
}

function SortableList<T extends Item = Item>({
  items,
  setItems,
  onCompleteItem,
  renderItem,
  onReorder,
  onReorderComplete,
}: SortableListProps<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const prevItemsRef = useRef(items);

  // Track if order changed during drag
  const [orderChanged, setOrderChanged] = useState(false);

  // Handler for drag start
  const handleDragStart = () => {
    setIsDragging(true);
    setOrderChanged(false);
    prevItemsRef.current = items;
  };
  // Handler for drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    if (orderChanged && onReorderComplete) {
      onReorderComplete(items);
    }
  };

  if (items) {
    return (
      <LayoutGroup>
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={(newItems) => {
            setItems(newItems);
            if (onReorder) onReorder(newItems);
            setOrderChanged(true);
          }}
          className="flex flex-col gap-2 mt-4"
        >
          <AnimatePresence>
            {items?.map((item, index) =>
              renderItem(
                item,
                index,
                onCompleteItem,
                (id: string) =>
                  setItems((items) => items.filter((item) => item.id !== id)),
                handleDragStart,
                handleDragEnd
              )
            )}
          </AnimatePresence>
        </Reorder.Group>
      </LayoutGroup>
    );
  }
  return null;
}

SortableList.displayName = "SortableList";

export { SortableList, SortableListItem };
export default SortableList;
