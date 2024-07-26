import {
  useApp,
  // useEffect,
  useElement,
  useImperativeHandle,
  // useInteractionState,
  useMemo,
  // useModel,
  // useStaleLayout,
} from '@nebula.js/stardust';

import properties from './object-properties';
import data from './data';
import ext from './ext';

/**
 * Entrypoint for your sense visualization
 * @param {object} galaxy Contains global settings from the environment.
 * Useful for cases when stardust hooks are unavailable (ie: outside the component function)
 * @param {object} galaxy.anything Extra environment dependent options
 * @param {object=} galaxy.anything.sense Optional object only present within Sense,
 * see: https://qlik.dev/extend/build-extension/in-qlik-sense
 */
export default function supernova(galaxy) {
  return {
    qae: {
      properties,
      data,
    },
    ext: ext(galaxy),
    component() {
      const element = useElement();
      const app = useApp();

      async function getCurrentUser() {
        let me;
        // check if we're on any qlikcloud.com domain
        if (window.location.origin.includes('qlikcloud.com')) {
          // create url - append '/api/v1/users/me' to the current domain
          const url = `${window.location.origin}/api/v1/users/me`;
          // fetch the current user
          const response = await fetch(url, {
            credentials: 'include',
          });
          // parse the response
          me = await response.json();
        }
        return me;
      }

      useMemo(() => {
        const button = document.createElement('button');
        button.appendChild(document.createElement('text'));
        button.firstChild.textContent = 'Trigger Custom Report';
        element.appendChild(button);

        button.onclick = async () => {
          const appId = app.id;
          const me = await getCurrentUser();
          const userId = me.id;
          const tempBook = await app.createTemporaryBookmark(
            {
              qIncludeVariables: true,
              qIncludeAllPatches: true,
            },
          );
          const payload = {
            appId,
            userId,
            tempBook,
          };
          console.log({ payload });
          // send data to backend
          const response = await fetch('https://localhost:4000/qlik-cloud-puppet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          // response is a pdf file for download
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');

          a.href = url;
          a.download = 'report.pdf';
          a.click();
        };
      }, []);

      useImperativeHandle(
        () => ({
          focus() {
            element.firstElementChild.onclick();
          },
        }),
        [element],
      );
    },
  };
}
