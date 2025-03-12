import React from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  children: React.ReactNode;
}

export function KanbanColumn({ id, title, color, children }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col w-[300px] min-w-[300px] h-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <motion.div layout className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
        {children}
      </motion.div>
    </div>
  );
}