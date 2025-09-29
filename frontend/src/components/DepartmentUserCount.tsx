import { useEffect, useState } from 'react';
import { useDepartmentStore } from '@/store/department';

interface DepartmentUserCountProps {
  departmentId: number;
  label?: string;
}

const DepartmentUserCount: React.FC<DepartmentUserCountProps> = ({ departmentId, label }) => {
  const { getDepartmentUserCount } = useDepartmentStore();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    getDepartmentUserCount(departmentId)
      .then((result) => {
        if (isMounted) setCount(result);
      })
    return () => {
      isMounted = false;
    };
  }, [departmentId]);

  return (
    <div className="flex justify-between text-sm">
      <span className="opacity-70">{label}:</span>
      <span className="badge badge-primary">{count || 0}</span>
    </div>
  );
};

export default DepartmentUserCount;