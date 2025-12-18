import { Flow } from '@pgflow/dsl';

type Input = {
  firstName: string;
  lastName: string;
};

export const GreetUser = new Flow<Input>({
  slug: 'greetUser',
})
  .step(
    { slug: 'fullName' },
    (input) => `${input.run.firstName} ${input.run.lastName}`
  )
  .step(
    { slug: 'greeting', dependsOn: ['fullName'] },
    (input) => `Hello, ${input.fullName}!`
  );
