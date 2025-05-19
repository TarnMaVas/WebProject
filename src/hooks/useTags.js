import { useState, useEffect } from "react";
import { getOptions } from "../firebase/services";

const DEFAULT_TAGS = [
  "JavaScript",
  "python",
  "Java",
  "StackOverflow",
  "GitHub",
];

export const useTags = () => {
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const options = await getOptions();

        let allTags = [];

        if (options && options.length > 0) {
          options.forEach((group) => {
            if (group.options && Array.isArray(group.options)) {
              group.options.forEach((option) => {
                if (option.label) {
                  allTags.push(option.label);
                }
              });
            }
          });
        }

        if (allTags.length === 0) {
          allTags = DEFAULT_TAGS;
        }

        setAvailableTags(allTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setError("Failed to load tags");
        setAvailableTags(DEFAULT_TAGS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  return { availableTags, isLoading, error };
};
