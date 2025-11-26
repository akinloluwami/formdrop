import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/docs/code-block";

export const Route = createFileRoute("/docs/api")({
  component: ApiDocs,
});

function ApiDocs() {
  return (
    <div className="max-w-4xl pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          API Reference
        </h1>
        <p className="text-xl text-gray-600">
          Programmatic access to FormDrop features.
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Authentication</h2>
          <p className="mb-4">
            FormDrop uses API keys for authentication. You can find your API
            keys in the dashboard settings.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-bold">Important:</span> There are two
                  types of API keys:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                  <li>
                    <strong>Public Key:</strong> Safe to use in frontend code.
                    Can only be used for submitting forms.
                  </li>
                  <li>
                    <strong>Private Key:</strong> Keep secret. Used for managing
                    forms and submissions. Never expose this in client-side
                    code.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mb-4">
            Authenticate your requests by including your API key in the{" "}
            <code>Authorization</code> header:
          </p>
          <CodeBlock
            code={`Authorization: Bearer YOUR_API_KEY`}
            language="http"
          />
          <p className="mt-4">
            Alternatively, for the <code>/collect</code> endpoint only, you can
            pass the key as a query parameter:
          </p>
          <CodeBlock
            code={`https://api.formdrop.io/collect?key=YOUR_PUBLIC_KEY`}
            language="url"
          />
        </section>

        <div className="space-y-12">
          {/* Submit Form */}
          <section id="submit-form">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-sm font-bold text-green-700 bg-green-100 rounded-lg">
                POST
              </span>
              <h2 className="text-2xl font-bold">Submit Form</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Send a new form submission. This endpoint is public and should be
              used from your frontend code. If the <code>form</code> doesn't
              exist, it will be created automatically.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
              <h3 className="font-semibold mb-4">Authentication</h3>
              <p className="text-sm text-gray-600 mb-4">
                You can authenticate using either a header or a query parameter.
              </p>
              <div className="space-y-3">
                <div className="flex gap-4 text-sm">
                  <span className="font-mono text-gray-500 w-24">Header</span>
                  <code className="text-accent">
                    Authorization: Bearer YOUR_PUBLIC_KEY
                  </code>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="font-mono text-gray-500 w-24">Query</span>
                  <code className="text-accent">?key=YOUR_PUBLIC_KEY</code>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
              <h3 className="font-semibold mb-4">Request Body</h3>
              <div className="space-y-3">
                <div className="flex gap-4 text-sm">
                  <span className="font-mono text-gray-500 w-24">form</span>
                  <span className="text-gray-600">
                    The name of your form (e.g. "Contact Us").
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="font-mono text-gray-500 w-24">data</span>
                  <span className="text-gray-600">
                    An object containing the form fields.
                  </span>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`// Example using fetch
fetch('https://api.formdrop.co/collect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_PUBLIC_KEY'
  },
  body: JSON.stringify({
    form: "Contact Us",
    data: {
      email: "user@example.com",
      message: "Hello world"
    }
  })
})`}
              language="javascript"
            />
          </section>

          {/* List Forms */}
          <section id="list-forms">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-sm font-bold text-blue-700 bg-blue-100 rounded-lg">
                GET
              </span>
              <h2 className="text-2xl font-bold">List Forms</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Retrieve a list of all your forms. Requires a private API key.
            </p>
            <CodeBlock
              code={`curl https://api.formdrop.co/forms \\
  -H "Authorization: Bearer YOUR_PRIVATE_KEY"`}
              language="bash"
            />
          </section>

          {/* Get Submissions */}
          <section id="get-submissions">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-sm font-bold text-blue-700 bg-blue-100 rounded-lg">
                GET
              </span>
              <h2 className="text-2xl font-bold">Get Submissions</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Retrieve submissions for a specific form. Requires a private API
              key.
            </p>
            <CodeBlock
              code={`curl https://api.formdrop.co/forms/:formId/submissions \\
  -H "Authorization: Bearer YOUR_PRIVATE_KEY"`}
              language="bash"
            />
          </section>

          {/* Delete Submission */}
          <section id="delete-submission">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-sm font-bold text-red-700 bg-red-100 rounded-lg">
                DELETE
              </span>
              <h2 className="text-2xl font-bold">Delete Submission</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Permanently delete a specific submission. Requires a private API
              key.
            </p>
            <CodeBlock
              code={`curl -X DELETE https://api.formdrop.co/forms/:formId/submissions/:submissionId \\
  -H "Authorization: Bearer YOUR_PRIVATE_KEY"`}
              language="bash"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
