import { useState } from 'react';

const useModal = (initShow?: boolean) => {
  const [show, setShow] = useState(initShow);
  const toggle = () => setShow(() => false);
  return { show, toggle, setShow };
};

export { useModal };
