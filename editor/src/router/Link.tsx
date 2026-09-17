import { navigate } from "./useRoute";

type Props = React.ComponentProps<"a"> & { to: string };

/**
 * A real `<a href>` — it can be copied, opened in a new tab and read by
 * assistive tech — that navigates in place on a plain left click.
 */
export const Link: React.FC<Props> = ({ to, onClick, ...props }) => (
  <a
    href={to}
    onClick={(event) => {
      onClick?.(event);
      const opensElsewhere =
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      if (event.defaultPrevented || opensElsewhere || event.button !== 0)
        return;
      event.preventDefault();
      navigate(to);
    }}
    {...props}
  />
);
