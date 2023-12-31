import { act, renderHook } from "@testing-library/react";
import { useForm } from "./../useForm";
import { z } from "zod";

describe("useForm", () => {
  describe("when initialize", () => {
    it("renders the defaults values correctly", () => {
      const defaultValues = {
        string: "",
        number: 0,
        boolean: true,
      };
      const { result } = renderHook(() =>
        useForm({ defaultValues, handleSubmit: () => {} })
      );

      expect(result.current.errors).toBeNull();
      expect(result.current.inputs.string).toBe("");
      expect(result.current.inputs.number).toBe(0);
      expect(result.current.inputs.boolean).toBeTruthy();
      expect(result.current.isSubmitting).toBeFalsy();
    });
  });

  describe("when changes the input value", () => {
    describe("when name of the input is correct", () => {
      it("updates the value correctly when is string", () => {
        const defaultValues = {
          test: "",
        };

        const mockEventValue = {
          currentTarget: {
            value: "test value",
            name: "test",
          },
        } as unknown as React.FormEvent<HTMLInputElement>;
        const { result } = renderHook(() =>
          useForm({ defaultValues, handleSubmit: () => {} })
        );

        act(() => result.current.handleChange(mockEventValue));

        expect(result.current.inputs.test).toBe("test value");
        expect(result.current.errors).toBeNull();
      });

      it("updates the value correctly when is number", () => {
        const defaultValues = {
          test: 0,
        };

        const mockEventValue = {
          currentTarget: {
            value: "1",
            name: "test",
          },
        } as unknown as React.FormEvent<HTMLInputElement>;

        const { result } = renderHook(() =>
          useForm({ defaultValues, handleSubmit: () => {} })
        );

        act(() => result.current.handleChange(mockEventValue));

        expect(result.current.errors).toBeNull();
        expect(result.current.inputs.test).toBe(1);
        expect(typeof result.current.inputs.test).toBe("number");
      });

      it("updates the value correctly when is boolean", () => {
        const defaultValues = {
          test: true,
        };

        const mockEventValue = {
          currentTarget: {
            checked: false,
            name: "test",
          },
        } as unknown as React.FormEvent<HTMLInputElement>;
        const { result } = renderHook(() =>
          useForm({ defaultValues, handleSubmit: () => {} })
        );

        act(() => result.current.handleChange(mockEventValue));

        expect(result.current.inputs.test).toBeFalsy();
        expect(result.current.errors).toBeNull();
      });
    });

    describe("when name of the input is wrong", () => {
      it("does not updates the value", () => {
        const defaultValues = {
          test: "",
        };

        const mockEventValue = {
          currentTarget: {
            value: "test value",
            name: "wrong name input",
          },
        } as unknown as React.FormEvent<HTMLInputElement>;
        const { result } = renderHook(() =>
          useForm({ defaultValues, handleSubmit: () => {} })
        );

        act(() => result.current.handleChange(mockEventValue));

        expect(result.current.inputs.test).toBe("");
        expect(result.current.errors).toBeNull();
      });
    });

    describe("when submit", () => {
      it("calls the submit function parameter", async () => {
        const defaultValues = {
          test: "",
        };

        const sumbmitEventMock = {
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>;

        const submitMock = vi.fn();

        const { result } = renderHook(() =>
          useForm({
            defaultValues,
            handleSubmit: submitMock,
          })
        );

        act(() => result.current.onSubmit(sumbmitEventMock));

        expect(submitMock).toHaveBeenCalled();
        expect(result.current.isSubmitting).toBeFalsy();
      });
    });

    describe("when has validation", () => {
      describe("the validation breaks", () => {
        it("get errors with function validation to string", () => {
          const defaultValues = {
            test: "submit test",
          };

          const sumbmitEventMock = {
            preventDefault: vi.fn(),
          } as unknown as React.FormEvent<HTMLFormElement>;

          const submitMock = vi.fn();

          const { result } = renderHook(() =>
            useForm({
              defaultValues,
              handleSubmit: submitMock,
              validation: (inputs, errors) => {
                if (inputs.test === "submit test") {
                  errors.test = "error message";
                }
              },
            })
          );

          act(() => result.current.onSubmit(sumbmitEventMock));

          expect(result.current.errors).not.toBeNull();
          expect(result.current.errors?.test).toBe("error message");
        });

        it("get errors with function validation to number", () => {
          const defaultValues = {
            test: 0,
          };

          const sumbmitEventMock = {
            preventDefault: vi.fn(),
          } as unknown as React.FormEvent<HTMLFormElement>;

          const submitMock = vi.fn();

          const { result } = renderHook(() =>
            useForm({
              defaultValues,
              handleSubmit: submitMock,
              validation: (inputs, errors) => {
                if (inputs.test === 0) {
                  errors.test = "error message";
                }
              },
            })
          );

          act(() => result.current.onSubmit(sumbmitEventMock));

          expect(result.current.errors).not.toBeNull();
          expect(result.current.errors?.test).toBe("error message");
        });

        it("get errors with function validation to boolean", () => {
          const defaultValues = {
            test: false,
          };

          const sumbmitEventMock = {
            preventDefault: vi.fn(),
          } as unknown as React.FormEvent<HTMLFormElement>;

          const submitMock = vi.fn();

          const { result } = renderHook(() =>
            useForm({
              defaultValues,
              handleSubmit: submitMock,
              validation: (inputs, errors) => {
                if (inputs.test === false) {
                  errors.test = "error message";
                }
              },
            })
          );

          act(() => result.current.onSubmit(sumbmitEventMock));

          expect(result.current.errors).not.toBeNull();
          expect(result.current.errors?.test).toBe("error message");
        });
      });

      describe("zod validation breaks", () => {
        describe("custom message error", () => {
          it("get errors with zod to string validation", () => {
            const defaultValues = {
              test: "submit test",
            };

            const sumbmitEventMock = {
              preventDefault: vi.fn(),
            } as unknown as React.FormEvent<HTMLFormElement>;

            const submitMock = vi.fn();

            const testSchema = z.object({
              test: z.string().max(3, "custom message error"),
            });
            const { result } = renderHook(() =>
              useForm({
                defaultValues,
                handleSubmit: submitMock,
                schema: testSchema,
              })
            );

            act(() => result.current.onSubmit(sumbmitEventMock));

            expect(result.current.errors).not.toBeNull();
            expect(result.current.errors?.test).toBe("custom message error");
          });

          it("get errors with zod to number validation", () => {
            const defaultValues = {
              test: 0,
            };

            const sumbmitEventMock = {
              preventDefault: vi.fn(),
            } as unknown as React.FormEvent<HTMLFormElement>;

            const submitMock = vi.fn();

            const testSchema = z.object({
              test: z.number().min(3, "custom message error"),
            });
            const { result } = renderHook(() =>
              useForm({
                defaultValues,
                handleSubmit: submitMock,
                schema: testSchema,
              })
            );

            act(() => result.current.onSubmit(sumbmitEventMock));

            expect(result.current.errors).not.toBeNull();
            expect(result.current.errors?.test).toBe("custom message error");
          });
        });

        describe("default message error", () => {
          it("get errors with zod string validation", () => {
            const defaultValues = {
              test: "submit test",
            };

            const sumbmitEventMock = {
              preventDefault: vi.fn(),
            } as unknown as React.FormEvent<HTMLFormElement>;

            const submitMock = vi.fn();

            const testSchema = z.object({
              test: z.string().max(3),
            });
            const { result } = renderHook(() =>
              useForm({
                defaultValues,
                handleSubmit: submitMock,
                schema: testSchema,
              })
            );

            act(() => result.current.onSubmit(sumbmitEventMock));

            expect(result.current.errors).not.toBeNull();
            expect(result.current.errors?.test).toBe(
              "String must contain at most 3 character(s)"
            );
          });

          it("get errors with zod number validation", () => {
            const defaultValues = {
              test: 0,
            };

            const sumbmitEventMock = {
              preventDefault: vi.fn(),
            } as unknown as React.FormEvent<HTMLFormElement>;

            const submitMock = vi.fn();

            const testSchema = z.object({
              test: z.number().min(3),
            });
            const { result } = renderHook(() =>
              useForm({
                defaultValues,
                handleSubmit: submitMock,
                schema: testSchema,
              })
            );

            act(() => result.current.onSubmit(sumbmitEventMock));

            expect(result.current.errors).not.toBeNull();
            expect(result.current.errors?.test).toBe(
              "Number must be greater than or equal to 3"
            );
          });
        });
      });
    });
  });
});
