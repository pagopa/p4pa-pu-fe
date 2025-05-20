import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, vi } from 'vitest';
import { zodResolver } from '@hookform/resolvers/zod';
import { testData } from '../testData';

const mockSubmit = vi.fn();

describe('Form Component', () => {
  test('Should render Form component correctly', () => {
    render(
      <Form onSubmit={mockSubmit} testId="form">
        <Form.Input type="text" name="test" />
      </Form>
    );

    expect(screen.getByTestId('form')).toBeInTheDocument();
    expect(screen.getByLabelText('test')).toBeInTheDocument();
  });

  test('Should render feedback messages for invalid inputs', async () => {
    render(
      <Form onSubmit={mockSubmit} resolver={zodResolver(exampleLoginSchema)}>
        <Form.Input type="email" name="email" />
        <Form.Input type="password" name="password" />
        <button type="submit">click me</button>
      </Form>
    );

    userEvent.click(screen.getByRole('button'));

    // Wait for validation errors to appear
    const alerts = await screen.findAllByRole('alert');
    expect(alerts).toHaveLength(2);
    expect(mockSubmit).not.toBeCalled();
  });

  test('Should call onSubmit function when the input is correct', async () => {
    render(
      <Form onSubmit={mockSubmit} resolver={zodResolver(exampleLoginSchema)}>
        <Form.Input type="email" name="email" />
        <Form.Input type="password" name="password" />
        <button type="submit">click me</button>
      </Form>
    );

    await userEvent.type(screen.getByLabelText('email'), testData.validEmail);
    await userEvent.type(
      screen.getByLabelText('password'),
      testData.validPassword
    );

    userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockSubmit).toBeCalled();
    });
  });

  test('Should not call onSubmit function when there is an invalid input', async () => {
    render(
      <Form onSubmit={mockSubmit} resolver={zodResolver(exampleLoginSchema)}>
        <Form.Input type="email" name="email" />
        <Form.Input type="password" name="password" />
        <button type="submit">click me</button>
      </Form>
    );

    await userEvent.type(screen.getByLabelText('email'), testData.invalidEmail);
    await userEvent.type(
      screen.getByLabelText('password'),
      testData.invalidPassword
    );

    userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockSubmit).not.toBeCalled();
    });
  });
});
