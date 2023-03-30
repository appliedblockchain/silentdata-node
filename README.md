# Silent Data Node.js Library

Node.js library to interact with Silent Data.

[Silent Data](https://silentdata.com/) leverages hardware secure enclaves with attestation, in particular, Intel SGX in order to enable privacy-preserving retrieval and processing of off-chain data, and generation of cryptographic proofs that are verifiable in blockchain smart contracts.

## Installation

```bash
npm install @appliedblockchain/silentdata-node

# or

yarn add @appliedblockchain/silentdata-node
```

## Usage

Supported check types: `balance`, `income`, `instagram` and `kyc`.

Supported blockchains: `algorand`, `polkadot` and `solana`.

Supported countries for `balance` and `income` checks: `CA`, `DE`, `ES`, `FR`, `GB`, `IE`, `IT`, `NL` and `US`.

### Start

```js
// with ECMAScript module format:
import { silentdata } from 'silentdata'

// with CommonJS module format:
const { silentdata } = require('silentdata')

const silentdataClient = silentdata(
  {
    baseUrl: process.env.SILENTDATA_BASE_URL,
    clientId: process.env.SILENTDATA_CLIENT_ID,
    clientSecret: process.env.SILENTDATA_CLIENT_SECRET,
  }
);
```

Using checks defaults:

```js
import { silentdata } from 'silentdata'

const silentdataClient = silentdata(
  {
    baseUrl: process.env.SILENTDATA_BASE_URL,
    clientId: process.env.SILENTDATA_CLIENT_ID,
    clientSecret: process.env.SILENTDATA_CLIENT_SECRET,
  },
  {
    checks: {
      redirectUrl: "https://redirect-url.com",
      webhookUrl: "https://webhook-url.com",
    },
  }
);
```

### Checks

To override `redirectUrl` and `webhookUrl` from defaults pass new values inside data object. 

Create a `balance` check:

```ts
import { CheckType, CheckBlockchain, CheckCountry } from 'silentdata'

const response = await silentdataClient.checks.create({
  type: CheckType.balance,
  data: {
    blockchain: CheckBlockchain.solana,
    walletAddress: "55S3CXGZnQbU6a7SMzbPvyCWg4v8CCUpJMv8tUB5zvMP",
    country: CheckCountry.gb,
    minimumBalance: 500,
  },
})
const { id, url } = response.data
```

Create an `income` check:

```ts
import { CheckType, CheckBlockchain, CheckCountry } from 'silentdata'

const response = await silentdataClient.checks.create({
  type: CheckType.income,
  data: {
    blockchain: CheckBlockchain.solana,
    walletAddress: "55S3CXGZnQbU6a7SMzbPvyCWg4v8CCUpJMv8tUB5zvMP",
    country: CheckCountry.gb,
    minimumIncome: 500,
  },
})
const { id, url } = response.data
```

Create an `instagram` check:

```ts
import { CheckType, CheckBlockchain } from 'silentdata'

const response = await silentdataClient.checks.create({
  type: CheckType.instagram,
  data: {
    blockchain: CheckBlockchain.solana,
    walletAddress: "55S3CXGZnQbU6a7SMzbPvyCWg4v8CCUpJMv8tUB5zvMP",
  },
})
const { id, url } = response.data
```

Create a `kyc` check:

```ts
import { CheckType, CheckBlockchain } from 'silentdata'

const response = await silentdataClient.checks.create({
  type: CheckType.kyc,
  data: {
    blockchain: CheckBlockchain.solana,
    walletAddress: "55S3CXGZnQbU6a7SMzbPvyCWg4v8CCUpJMv8tUB5zvMP",
  },
})
const { id, url } = response.data
```

Read a check by id:

```ts
import { CheckType } from 'silentdata'

const response = await silentdataClient.checks.readById({
  type: CheckType.instagram,
  id,
})
const check = response.data.check
```

Read checks:

```ts
import { CheckType } from 'silentdata'

const response = await silentdataClient.checks.read({
  type: CheckType.instagram,
  limit: 10,
  offset: 1,
})
const checks = response.data.checks
```

Delete a check by id:

```ts
import { CheckType } from 'silentdata'

const response = await silentdataClient.checks.delete({
  type: CheckType.instagram,
  id,
})
const isDeleted = response.data
```

Check resource: 

```ts
import { CheckType } from 'silentdata'

const response = await silentdataClient.checks.readById({
  type: CheckType.instagram,
  id,
})
const check = response.data.check
const {
  id,
  date,
  signingKey,
  signature,
  rawData,
  error: { code, message },
} = check.data
const isCancelled = check.isCancelled()
const isCompleted = check.isCompleted()
const isError = check.isError()
const isPending = check.isPending()
const isInProgress = check.isInProgress()
const isCertified = check.isCertified()
```

Check verification:

```ts
import { VerifyCheckError, VerifyCheckErrorCode } from 'silentdata'

try {
  await check.verify()
} catch (error: VerifyCheckError) {
  if (error.code === VerifyCheckErrorCode.invalid_signature) {
    // handle invalid signature error
  }
  // handle other errors
}
```

Check `balance` certificate data: 

```ts
const {
  check_hash,
  id,
  timestamp,
  initiator_pkey,
  certificate_hash,
  currency_code,
  comparison_value,
  server_timestamp,
  server_common_name,
} = balanceCheck.getCertificateDataAsJSON()
```

Check `income` certificate data: 

```ts
const {
  check_hash,
  id,
  timestamp,
  initiator_pkey,
  certificate_hash,
  currency_code,
  comparison_value,
  server_timestamp,
  server_common_name,
} = incomeCheck.getCertificateDataAsJSON()
```

Check `instagram` certificate data: 

```ts
const { 
  check_hash, 
  id, 
  timestamp, 
  initiator_pkey, 
  certificate_hash, 
  ig_username, 
  ig_account_type 
} = instagramCheck.getCertificateDataAsJSON()
```

Check `kyc` certificate data: 

```ts
const { 
  check_hash, 
  id, 
  timestamp, 
  initiator_pkey, 
  certificate_hash, 
  check_timestamp, 
  subject_id 
} = kycCheck.getCertificateDataAsJSON()
```

### Enclaves

Read an enclave by check `signingKey`:

```ts
import { CheckType } from 'silentdata'

const response = await silentdataClient.enclaves.read({
  signingKey: check.data.signingKey
});
const enclave = response.data.enclave
const {
  date,
  mrenclave,
  iasCertChain,
  iasReport,
  iasSignature,
  publicKeys
} = enclave.data
const isActive = enclave.isActive()
const isRevoked = enclave.isRevoked()
const isRetired = enclave.isRetired()
for (const { publicKey, algorithm, usage } of publicKeys) {}
```

Enclave verification:

```ts
import { VerifyEnclaveError, VerifyEnclaveErrorCode } from 'silentdata'

try {
  await enclave.verify()
} catch (error: VerifyEnclaveError) {
  if (error.code === VerifyEnclaveErrorCode.invalid_signature) {
    // handle invalid signature error
  }
  // handle other errors
}
```