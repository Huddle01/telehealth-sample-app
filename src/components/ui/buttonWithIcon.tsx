import clsx from 'clsx';

interface ButtonWithIconProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const ButtonWithIcon = ({
  children,
  onClick,
  className,
}: ButtonWithIconProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'bg-gray-600/50 p-2.5 rounded-lg hover:bg-gray-600',
        className ? className : ''
      )}
    >
      {children}
    </button>
  );
};

export default ButtonWithIcon;
