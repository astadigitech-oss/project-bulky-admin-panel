import GB from "country-flag-icons/react/3x2/GB";
import ID from "country-flag-icons/react/3x2/ID";

export const HeaderDuoLang = ({
  title,
  en = false,
}: {
  title: string;
  /**
   * for english language
   */
  en?: boolean;
}) => {
  return (
    <div className="flex items-center gap-2">
      {title} <Flag en={en} />
    </div>
  );
};

export const Flag = ({ en = false }: { en?: boolean }) => {
  if (en) return <GB className="h-3 aspect-3/2 rounded shadow flex-none" />;
  return <ID className="h-3 aspect-3/2 rounded shadow flex-none" />;
};
