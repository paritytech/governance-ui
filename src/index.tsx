import React, { useEffect, useState } from "react";
import * as ReactDOMClient from 'react-dom/client';
import { createTheme, NextUIProvider } from "@nextui-org/react";
import { Button, CloseSquareIcon, HeartIcon, Loading, Spacer, SwipeableCard, Text } from "./components/common";
import { ReferendumCard, VotesTable } from "./components";
import useSearchParam from "./hooks/useSearchParam";
import { Referendum, Vote } from "./types";
import { pop } from "./utils";
import { getAllReferendums } from "./chain/democracy";
import { endpointFor, Network, newApi } from "./utils/polkadot-api";

function App() {
  const networkParam = useSearchParam("network");
  const rpcParam = useSearchParam("rpc");
  const network = Network.parse(networkParam);
  const [referendums, setReferendums] = useState<Array<Referendum> | undefined>();
  const [votes, setVotes] = useState<Array<Vote>>([]);

  useEffect(() => {
    async function fetchData() {
      const api = await newApi(rpcParam ? rpcParam : endpointFor(network));
      if (rpcParam) {
        // Check that provided rpc and network point to a same logical chain
        const connectedChain = api.runtimeChain.toHuman() as Network;
        if (connectedChain != network) {
          console.error(`Provided RPC doesn't match network ${network}: ${rpcParam}`);
        } else {
          console.info(`Connected to network ${network} using RPC ${rpcParam}`);
        }
      } else {
        console.info(`Connected to network ${network.toString()}`);
      }

      // Retrieve all referendums, then display them
      const referendums = await getAllReferendums(api);
      setReferendums(referendums);
    }
    fetchData();
  }, []);

  function voteOn(idx: number, vote: boolean, referendum: Referendum | undefined) {
    if (referendum) {
      setVotes([...votes, {index: idx, vote: vote, referendum: referendum}])
      setReferendums(referendums && pop(referendums));
    }
  }

  return (
    <>
      <div style={{display: "flex", flex: 1, alignItems: "center", justifyContent:"center", flexDirection: "column"}}>
      {(referendums && referendums.length > 0) &&
        <>
          <div style={{display: "flex", flex: 1, alignItems: "center", justifyContent:"center"}}>
            {referendums.map((referendum, idx) => {
            return (
              <SwipeableCard key={idx} onVote={(vote: boolean) => voteOn(idx, vote, referendum)} drag={true}>
                <ReferendumCard network={network} referendum={referendum} />
              </SwipeableCard>
            );
            })}
          </div>
          <div style={{display: "flex"}}>
            <Button
              color="error"
              onPress={() => voteOn(0, false, referendums.at(0))}
              icon={<CloseSquareIcon set="light" primaryColor="currentColor" filled />} />
            <Spacer x={2} />
            <Button
              color="success"
              onPress={() => voteOn(0, true, referendums.at(0))}
              icon={<HeartIcon primaryColor="currentColor" filled />} />
          </div>
          <Spacer y={1} />
        </>
        }
        {(referendums?.length == 0) && 
        <VotesTable votes={votes} />}
        {!referendums && 
        <div style={{display: "flex", flexDirection: "column"}}>
          <Loading />
          <Spacer y={2} />
          <Text
            h1
            size={60}
            color="#e6007a"
            css={{
              textAlign: "center"
            }}>Get ready to vote!</Text>
        </div>}
      </div>
    </>
  );
}

const theme = createTheme({
  type: "light",
  theme: {
    fonts: {
      sans: 'Unbounded',
    }
  }
})

const container = document.getElementById('root');
if (container) {
  const root = ReactDOMClient.createRoot(container);
  root.render(
    <React.StrictMode>
      <NextUIProvider theme={theme}>
        <main style={{display: "flex", height: "100vh"}}>
          <App />
        </main>
      </NextUIProvider>
    </React.StrictMode>
  );
}

navigator.permissions.query({ name: "periodic-background-sync" }).then((status)=>{ console.log(status)})

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(
    new URL('service-worker.js', import.meta.url),
    {type: 'module'}
  )
  .then(_reg => navigator.serviceWorker.ready)
  .then(async reg => {
    //await Notification.requestPermission();

/*   if (reg.periodicSync) {
      await reg.periodicSync.register('sync-chain', {
        minInterval: 10 * 1000,
      });
    }
*/
//    reg.showNotification("Markdowns synced to server");
      reg.addEventListener('updatefound', () => {
      // A wild service worker has appeared in reg.installing!
      const newWorker = reg.installing;

      if (newWorker) {
        newWorker.state;
        // "installing" - the install event has fired, but not yet complete
        // "installed"  - install complete
        // "activating" - the activate event has fired, but not yet complete
        // "activated"  - fully active
        // "redundant"  - discarded. Either failed install, or it's been
        //                replaced by a newer version
    
        newWorker.addEventListener('statechange', () => {
          // newWorker.state has changed
        });
      }
    });
  })
  .catch(err => {
    console.log(`ServiceWorker registration failed: ${err}`);
  });;
}

navigator.serviceWorker.addEventListener('controllerchange', () => {
  // This fires when the service worker controlling this page
  // changes, eg a new worker has skipped waiting and become
  // the new active worker.
  console.log("New ServiceWorker has been activated");
});

navigator.serviceWorker.addEventListener('beforeinstallprompt', () => {
  // This fires when the service worker controlling this page
  // changes, eg a new worker has skipped waiting and become
  // the new active worker.
  console.log("About to be installed");
});

window.addEventListener('appinstalled', () => {
  // This fires when the app has been installed
  console.log("App installed");
});