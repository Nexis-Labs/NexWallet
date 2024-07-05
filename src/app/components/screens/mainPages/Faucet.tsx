import React from "react";
import { Field, Form } from "react-final-form";
import Button from "app/components/elements/Button";
import Input from "app/components/elements/Input";
import { composeValidators, required } from "app/utils";
import axios from "axios";
import { useDialog } from "app/hooks/dialog";

function Faucet() {
  const { alert } = useDialog();

  const onSubmit = (values: any) => {
    axios
      .post("https://evm-faucet-devnet.nexscan.io/api", values.username)
      .then((response) => {
        alert({
          title: "Success!",
          content: "Successfully claimed 1 NZT token.",
        });
        console.log(response.data);
      })
      .catch((error) => {
        alert({
          title: "Error!",
          content:
            error?.response?.data ||
            error?.message ||
            "Failed to claim token. Please try again later.",
        });
        console.error("Error making the POST request:", error);
      });
  };

  return (
    <div>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit, submitting }) => (
          <>
            <p className="mb-6 text-base text-brand-gray">
              Claim free NZT Devnet Tokens from this faucet! TBR: It is not real
              money, but still use wisely
            </p>

            <Field name="address" validate={composeValidators(required)}>
              {({ input, meta }) => (
                <Input
                  label="Your Nexis EVM wallet Address"
                  placeholder="0x32D6434b054FC8fE2905501842cD298c09833847"
                  StartAdornment={() => (
                    <div className="absolute left-3 top-0 bottom-0 flex items-center"></div>
                  )}
                  error={meta.error && meta.touched}
                  errorMessage={meta.error}
                  className="mb-6 max-w-[20rem]"
                  inputClassName="!pl-7"
                  {...input}
                />
              )}
            </Field>

            <Button
              className="mx-auto"
              disabled={submitting}
              onClick={handleSubmit}
              loading={false}
            >
              Claim 1 NZT
            </Button>
          </>
        )}
      />
    </div>
  );
}

export default Faucet;
