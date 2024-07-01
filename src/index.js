import {
  useApp,
  // useEffect,
  useElement,
  useImperativeHandle,
  useInteractionState,
  useMemo,
  useModel,
  useStaleLayout,
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
      const layout = useStaleLayout();
      const model = useModel();
      const app = useApp();
      const interactions = useInteractionState();

      async function getCurrentUser() {
        let me;
        // fetch current user, attach session cookie to the header
        // we can grab it from window.location.origin if extension is installed on the tenant. in dev, we're at localhost:8000 and it won't work unless we use @qlik/api

        // check if we're not on localhost
        if (window.location.origin !== 'http://localhost:8000') {
          const response = await fetch('https://kassovitz.us.qlikcloud.com/api/v1/users/me', {
            credentials: 'include',
          });
          me = await response.json();
        } else {
          me = {
            id: '_Mvc3vkMq2YXadXEnYIkb08rXEBXn6L8',
            tenantId: 'eXKsT_Tl6TWW-hfR_XXonoN-3IPgy3up',
            status: 'active',
            subject: 'auth0|a08D000001KMO3xIAH',
            name: 'Ran Kassovitz',
            email: 'ran.kassovitz@qlik.com',
          };
        }
        return me;
      }

      useMemo(() => {
        const button = document.createElement('button');
        button.appendChild(document.createElement('text'));
        button.firstChild.textContent = 'Click me!';
        element.appendChild(button);

        button.onclick = async () => {
          console.log('clicked');
          console.log({
            layout, model, app, interactions,
          });
          // get app id
          const appId = app.id;
          console.log('appId', appId);
          // current user
          const me = await getCurrentUser();
          const userId = me.id;
          console.log('userId', userId);
          const bookmarkId = '';
          // create temporary bookmark //  app.createTemporaryBookmark is not available
          // const tempBook = await app.createTemporaryBookmark([
          //   {
          //     qIncludeVariables: true,
          //     qIncludeAllPatches: true,
          //   },
          //   [
          //     'value',
          //   ],
          // ]);
          // console.log('tempBook', tempBook);
          // const bookmarkId = tempBook.id;
          // console.log('bookmarkId', bookmarkId);
          // const payload = {
          //   appId,
          //   userId,
          //   // bookmarkId,
          // };
          // send data to backend
          // const response = await fetch('https://localhost:4000/qlik-cloud-puppet', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          //   body: JSON.stringify(payload),
          // });

          // fetch with query params
          const response = await fetch(`https://localhost:4000/qlik-cloud-puppet?appId=${appId}&userId=${userId}&bookmarkId=${bookmarkId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
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
